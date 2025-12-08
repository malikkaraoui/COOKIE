import ccxt from "ccxt";

const binance = new ccxt.binanceusdm({
	enableRateLimit: true,
});

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
	const now = Date.now();
	const sinceMs = now - days * 24 * 60 * 60 * 1000;

	const raw = (await (binance as any).fapiPublicGetFundingRate({
		symbol,
		startTime: sinceMs,
		limit: 1000,
	})) as Array<{
		fundingRate: string;
		fundingTime: number;
	}>;

	if (!raw.length) {
		return {
			symbol,
			points: [],
			meanPerInterval: 0,
			intervalsPerDay: 0,
			aprFunding: 0,
			apyFunding: 0,
		};
	}

	const points: FundingPoint[] = raw.map((p) => ({
		time: p.fundingTime,
		rate: parseFloat(p.fundingRate),
	}));

	const meanPerInterval =
		points.reduce((sum, p) => sum + p.rate, 0) / points.length;

	const intervalsPerDay = points.length / days;
	const intervalsPerYear = intervalsPerDay * 365;

	const aprFunding = meanPerInterval * intervalsPerYear;
	const apyFunding = Math.pow(1 + meanPerInterval, intervalsPerYear) - 1;

	return {
		symbol,
		points,
		meanPerInterval,
		intervalsPerDay,
		aprFunding,
		apyFunding,
	};
}
