import { onRequest } from "firebase-functions/v2/https";
import { logger } from "firebase-functions";
import { FundingServiceError, getFundingMetrics } from "../fundingService";

export const fundingMetrics = onRequest({ region: "europe-west1" }, async (req, res) => {
	res.set("Access-Control-Allow-Origin", "*");
	res.set("Access-Control-Allow-Methods", "GET, OPTIONS");
	res.set("Access-Control-Allow-Headers", "Content-Type");
	res.set("Cache-Control", "public, max-age=60");

	if (req.method === "OPTIONS") {
		res.status(204).send("");
		return;
	}

	try {
		const symbol = (req.query.symbol as string) || "ETHUSDT";
		const days = Number.parseInt((req.query.days as string) || "20", 10);

		const metrics = await getFundingMetrics(symbol, days);

		res.status(200).json(metrics);
	} catch (error: unknown) {
		const errorInstance = error as Error;
		const isFundingError = error instanceof FundingServiceError;
		const status = isFundingError ? error.status : 500;
		const code = isFundingError ? error.code : "funding/internal";
		const message = errorInstance?.message || "Unknown error";

		logger.error("fundingMetrics", { code, message, status });
		res.status(status).json({ error: { code, message } });
	}
});
