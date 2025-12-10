import { onRequest } from "firebase-functions/v2/https";
import { logger } from "firebase-functions/logger";
import type { Request, Response } from "express";
import ccxt from "ccxt";

const DEFAULT_TIMEFRAMES = [5, 10, 15, 20];
const DAY_IN_MS = 24 * 60 * 60 * 1000;
const DEFAULT_EXCHANGE = "binance";
const DEFAULT_QUOTE = "USDT";
const MAX_TIMEFRAME = 120;

type SeriesEntry = { time: number; close: number };
type TokenHistoryPayload = {
	symbol: string;
	pair: string;
	returns: Record<number, number | null>;
	series: SeriesEntry[];
	lastClose: number | null;
	lastTimestamp: number | null;
	sampleSize: number;
	ok: boolean;
	error?: string;
};

type NormalizedSymbol = {
	base: string;
	pair: string;
};

const exchangeCache = new Map<string, ccxt.Exchange>();

function sanitizeTimeframes(input: unknown): number[] {
	const raw = Array.isArray(input) ? input : DEFAULT_TIMEFRAMES;
	const normalized = Array.from(
		new Set(
			raw
				.map((value) => Number(value))
				.filter((value) => Number.isFinite(value) && value > 0)
				.map((value) => Math.round(value)),
		),
	)
		.filter((value) => value <= MAX_TIMEFRAME)
		.sort((a, b) => a - b);

	return normalized.length ? normalized : DEFAULT_TIMEFRAMES;
}

function sanitizeQuote(value: unknown): string {
	const quote = typeof value === "string" ? value : DEFAULT_QUOTE;
	const normalized = quote.trim().toUpperCase();
	return normalized || DEFAULT_QUOTE;
}

function sanitizeExchange(value: unknown): string {
	const exchange = typeof value === "string" ? value : DEFAULT_EXCHANGE;
	const normalized = exchange.trim().toLowerCase();
	return normalized || DEFAULT_EXCHANGE;
}

function sanitizeSymbols(input: unknown, quote: string): NormalizedSymbol[] {
	const rawArray = Array.isArray(input) ? input : [];
	const uniques = new Map<string, NormalizedSymbol>();
	const normalizedQuote = sanitizeQuote(quote);

	rawArray.forEach((entry) => {
		let symbol: string | undefined;
		if (typeof entry === "string") {
			symbol = entry;
		} else if (entry && typeof entry === "object" && typeof (entry as any).symbol === "string") {
			symbol = (entry as any).symbol;
		}
		if (!symbol) {
			return;
		}
		const trimmed = symbol.trim().toUpperCase();
		if (!trimmed) {
			return;
		}
		const pair = trimmed.includes("/") ? trimmed : `${trimmed}/${normalizedQuote}`;
		const [base] = pair.split("/");
		if (!base) {
			return;
		}
		uniques.set(pair, { base, pair });
	});

	return Array.from(uniques.values());
}

function ensureExchange(id: string): ccxt.Exchange {
	const key = id.toLowerCase();
	if (exchangeCache.has(key)) {
		return exchangeCache.get(key)!;
	}
	const ExchangeCtor = (ccxt as Record<string, any>)[key];
	if (!ExchangeCtor) {
		throw new Error(`Exchange ${id} non supporté par CCXT`);
	}
	const instance: ccxt.Exchange = new ExchangeCtor({ enableRateLimit: true });
	exchangeCache.set(key, instance);
	return instance;
}

function computeReturns(series: SeriesEntry[], timeframes: number[]): Record<number, number | null> {
	const returns: Record<number, number | null> = {};
	if (!series.length) {
		return returns;
	}
	timeframes.forEach((days) => {
		const referenceIndex = series.length - 1 - days;
		if (referenceIndex < 0) {
			returns[days] = null;
			return;
		}
		const referenceClose = series[referenceIndex]?.close;
		const lastClose = series[series.length - 1]?.close;
		if (!Number.isFinite(referenceClose) || referenceClose <= 0 || !Number.isFinite(lastClose)) {
			returns[days] = null;
			return;
		}
		returns[days] = ((lastClose - referenceClose) / referenceClose) * 100;
	});
	return returns;
}

function normalizeSeries(rawCandles: ccxt.OHLCV[] | undefined | null): SeriesEntry[] {
	if (!Array.isArray(rawCandles)) {
		return [];
	}
	return rawCandles
		.map((candle) => ({ time: Number(candle?.[0]), close: Number(candle?.[4]) }))
		.filter((entry) => Number.isFinite(entry.time) && Number.isFinite(entry.close) && entry.close > 0)
		.sort((a, b) => a.time - b.time);
}

async function fetchSeriesForPair(
	exchange: ccxt.Exchange,
	pair: string,
	maxDays: number,
): Promise<SeriesEntry[]> {
	const paddingDays = 3;
	const since = Date.now() - (maxDays + paddingDays) * DAY_IN_MS;
	const limit = Math.min(Math.max(maxDays + paddingDays, 10), 500);
	const candles = await exchange.fetchOHLCV(pair, "1d", since, limit);
	return normalizeSeries(candles);
}

async function buildHistoryForSymbol(
	exchange: ccxt.Exchange,
	symbol: NormalizedSymbol,
	timeframes: number[],
): Promise<TokenHistoryPayload> {
	const maxDays = Math.max(...timeframes, DEFAULT_TIMEFRAMES[DEFAULT_TIMEFRAMES.length - 1]);
	const series = await fetchSeriesForPair(exchange, symbol.pair, maxDays);
	const returns = computeReturns(series, timeframes);
	const lastEntry = series[series.length - 1] ?? null;
	return {
		symbol: symbol.base,
		pair: symbol.pair,
		returns,
		series,
		lastClose: lastEntry?.close ?? null,
		lastTimestamp: lastEntry?.time ?? null,
		sampleSize: series.length,
		ok: true,
	};
}

const ccxtHistoryHandler = async (req: Request, res: Response) => {
	res.set("Access-Control-Allow-Origin", "*");
	res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
	res.set("Access-Control-Allow-Headers", "Content-Type");

	if (req.method === "OPTIONS") {
		res.status(204).send("\n");
		return;
	}

	if (req.method !== "POST") {
		res.status(405).json({ error: "Method not allowed" });
		return;
	}

	const body = (req.body && typeof req.body === "object") ? req.body : {};
	const quote = sanitizeQuote(body.quote);
	const exchangeId = sanitizeExchange(body.exchange);
	const timeframes = sanitizeTimeframes(body.timeframes);
	const symbols = sanitizeSymbols(body.symbols, quote);

	if (!symbols.length) {
		res.status(400).json({ error: "Fournis au moins un symbole valide" });
		return;
	}

	let exchangeInstance: ccxt.Exchange;
	try {
		exchangeInstance = ensureExchange(exchangeId);
	} catch (error: any) {
		res.status(400).json({ error: error?.message || "Exchange CCXT inconnu" });
		return;
	}

	const payload: Record<string, TokenHistoryPayload> = {};
	for (const symbol of symbols) {
		try {
			payload[symbol.base] = await buildHistoryForSymbol(exchangeInstance, symbol, timeframes);
		} catch (error: any) {
			logger.error("ccxtHistory symbol failure", {
				symbol: symbol.pair,
				message: error?.message,
				stack: error?.stack,
			});
			payload[symbol.base] = {
				symbol: symbol.base,
				pair: symbol.pair,
				returns: {},
				series: [],
				lastClose: null,
				lastTimestamp: null,
				sampleSize: 0,
				ok: false,
				error: error?.message || "Erreur CCXT",
			};
		}
	}

	res.status(200).json({
		ok: true,
		exchange: exchangeId,
		quote,
		timeframes,
		symbols: payload,
	});
};

export const ccxtHistory = onRequest(
	{
		region: "us-central1",
		memory: "512MiB",
		timeoutSeconds: 60,
		maxInstances: 10,
	},
	ccxtHistoryHandler,
);
