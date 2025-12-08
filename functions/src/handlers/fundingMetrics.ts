import { onRequest } from "firebase-functions/v2/https";
import { getFundingMetrics } from "../fundingService";

export const fundingMetrics = onRequest({ region: "europe-west1" }, async (req, res) => {
	res.set("Access-Control-Allow-Origin", "*");
	res.set("Access-Control-Allow-Methods", "GET, OPTIONS");
	res.set("Access-Control-Allow-Headers", "Content-Type");

	if (req.method === "OPTIONS") {
		res.status(204).send("");
		return;
	}

	try {
		const symbol = (req.query.symbol as string) || "ETHUSDT";
		const days = parseInt((req.query.days as string) || "20", 10);

		const metrics = await getFundingMetrics(symbol.toUpperCase(), days);

		res.json(metrics);
	} catch (error) {
		console.error("fundingMetrics", error);
		const message = error instanceof Error ? error.message : "Unknown error";
		res.status(500).json({ error: message });
	}
});
