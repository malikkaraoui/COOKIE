import * as functions from "firebase-functions/v1";
import { listStrategyStates } from "../../store/fundingStrategyStore";

export const getFundingStrategyState = functions.https.onRequest(async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, OPTIONS" );
  res.set("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const states = await listStrategyStates();
  res.status(200).json({ ok: true, states });
});
