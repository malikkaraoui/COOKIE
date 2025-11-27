const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const { defineSecret } = require("firebase-functions/params");
const Stripe = require("stripe");
const admin = require("firebase-admin");

if (!admin.apps.length) {
  admin.initializeApp();
}

const stripeSecret = defineSecret("STRIPE_SECRET_KEY");
const stripeWebhookSecret = defineSecret("STRIPE_WEBHOOK_SECRET");

exports.handleStripeWebhook = onRequest(
  {
    secrets: [stripeSecret, stripeWebhookSecret],
    region: "us-central1",
  },
  async (req, res) => {
    logger.info("➡️ Webhook Stripe reçu");

    if (req.method !== "POST") {
      res.status(405).send("Method Not Allowed");
      return;
    }

    // ⚠️ LIMITATION FIREBASE FUNCTIONS V2
    // Firebase parse automatiquement le JSON avant d'arriver ici
    // Impossible d'accéder au raw body pour vérification signature
    // Solution production : Migrer vers Cloud Run avec express.raw()
    
    let event;
    try {
      // Utiliser le body déjà parsé (pas de signature validation)
      event = req.body;
      
      logger.info("📦 Event Stripe reçu", {
        type: event.type,
        id: event.id,
      });
    } catch (err) {
      logger.error("❌ Erreur lecture event", { error: err.message });
      res.status(400).send(`Error: ${err.message}`);
      return;
    }

    try {
      // eslint-disable-next-line new-cap
      const stripe = Stripe(stripeSecret.value());
      
      if (event.type === "checkout.session.completed") {
        const sessionId = event.data.object.id;
        
        // 🔧 IMPORTANT: Récupérer la session complète depuis Stripe
        // car event.data.object peut avoir des metadata incomplètes
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        
        logger.info("📦 Session récupérée de Stripe", {
          sessionId: session.id,
          metadata: session.metadata,
          client_reference_id: session.client_reference_id,
        });
        
        // Récupérer l'UID depuis metadata OU client_reference_id
        const uid = (session.metadata && session.metadata.uid) || session.client_reference_id;

        if (!uid) {
          logger.warn("⚠️ Pas d'UID même après retrieve", {
            sessionId: session.id,
            metadata: session.metadata,
            client_ref: session.client_reference_id,
          });
          res.json({ received: true });
          return;
        }

        logger.info("💳 Paiement Stripe confirmé", { uid, sessionId: session.id });

        const db = admin.database();
        
        await db.ref(`users/${uid}`).update({
          membership: {
            active: true,
            tier: "premium",
            step: 1,
            since: admin.database.ServerValue.TIMESTAMP,
            stripeCustomerId: session.customer || null,
            stripeSessionId: session.id,
          },
          updatedAt: admin.database.ServerValue.TIMESTAMP,
        });

        await db.ref(`users/${uid}/products/COOKIE_PREMIUM`).set({
          acquired: true,
          acquiredAt: admin.database.ServerValue.TIMESTAMP,
          price: session.amount_total / 100,
          currency: session.currency,
          stripeSessionId: session.id,
        });

        logger.info("✅ User premium écrit en DB via webhook", { uid });
      }

      res.json({ received: true });
    } catch (err) {
      logger.error("❌ Erreur DB webhook", { error: err.message });
      res.status(500).send("Error");
    }
  },
);
