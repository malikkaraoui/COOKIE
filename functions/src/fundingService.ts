import ccxt from "ccxt";

const binance = new ccxt.binanceusdm({
	enableRateLimit: true,
});

export class FundingServiceError extends Error {
	constructor(
		message: string,
		public status: number = 500,
		public code: string = "funding/internal"
	) {
		super(message);
	}
}

const MAX_DAYS = 90;

function normaliseSymbol(input: string): string {
	return input?.toUpperCase().trim();
}

export type FundingPoint = {
	time: number;
	rate: number;
};

export type FundingMetrics = {
	symbol: string;
	points: FundingPoint[];
	meanPerInterval: number;
	intervalsPerDay: number;
	aprFunding: number;
	apyFunding: number;
};

export async function getFundingMetrics(
	symbol: string,
	days: number
): Promise<FundingMetrics> {
	const formattedSymbol = normaliseSymbol(symbol);
	if (!formattedSymbol) {
		throw new FundingServiceError(
			"Paramètre symbol manquant",
			400,
			"funding/missing-symbol"
		);
	}

	const safeDays = Math.min(Math.max(days, 1), MAX_DAYS);
	const now = Date.now();
	const sinceMs = now - safeDays * 24 * 60 * 60 * 1000;

	let raw: Array<{ fundingRate: string; fundingTime: number | string }>;
	try {
		raw = (await (binance as any).fapiPublicGetFundingRate({
			symbol: formattedSymbol,
			startTime: sinceMs,
			limit: 1000,
		})) as Array<{
			fundingRate: string;
			fundingTime: number | string;
		}>;
	} catch (error: any) {
		const message = error?.message || "Impossible de récupérer le funding";
		const status = error?.httpStatus || error?.status || 502;
		const code = error?.code ? `binance/${error.code}` : "funding/binance-error";
		throw new FundingServiceError(message, status, code);
	}

	if (!raw.length) {
		return {
			symbol: formattedSymbol,
			points: [],
			meanPerInterval: 0,
			intervalsPerDay: 0,
			aprFunding: 0,
			apyFunding: 0,
		};
	}

	const points: FundingPoint[] = raw.map((p) => ({
		time: Number(p.fundingTime),
		rate: parseFloat(p.fundingRate),
	}));

	const validPoints = points.filter(
		(point) => Number.isFinite(point.time) && Number.isFinite(point.rate)
	);

	if (!validPoints.length) {
		throw new FundingServiceError(
			"Aucune donnée exploitable renvoyée par Binance",
			502,
			"funding/empty-payload"
		);
	}

	const meanPerInterval =
 		validPoints.reduce((sum, p) => sum + p.rate, 0) / validPoints.length;

	const intervalsPerDay = validPoints.length / safeDays;
	const intervalsPerYear = intervalsPerDay * 365;

	const aprFunding = meanPerInterval * intervalsPerYear;
	const apyFunding = Math.pow(1 + meanPerInterval, intervalsPerYear) - 1;

	return {
		symbol: formattedSymbol,
		points: validPoints,
		meanPerInterval,
		intervalsPerDay,
		aprFunding,
		apyFunding,
	};
}
