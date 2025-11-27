// functions/stripeWebhooks.js

const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const { defineSecret } = require("firebase-functions/params");
const Stripe = require("stripe");
const admin = require("firebase-admin");

// Secrets Stripe
const stripeSecret = defineSecret("STRIPE_SECRET_KEY");
const stripeWebhookSecret = defineSecret("STRIPE_WEBHOOK_SECRET");

exports.handleStripeWebhook = onRequest(
  {
    secrets: [stripeSecret, stripeWebhookSecret],
    region: "us-central1",
  },
  async (req, res) => {
    logger.info("🌐 Requête webhook reçue", {
      method: req.method,
      headers: Object.keys(req.headers),
      hasSignature: !!req.headers["stripe-signature"],
    });

    // Stripe n'envoie que des POST
    if (req.method !== "POST") {
      logger.warn("⚠️ Méthode non autorisée", { method: req.method });
      res.status(405).send("Method Not Allowed");
      return;
    }

    const sig = req.headers["stripe-signature"];

    if (!sig) {
      logger.error("❌ Signature Stripe manquante dans les headers");
      res.status(400).send("No signature");
      return;
    }

    let event;
    try {
      const stripe = new Stripe(stripeSecret.value(), {
        apiVersion: "2024-06-20",
      });

      logger.info("🔐 Vérification signature Stripe...", {
        signaturePresent: !!sig,
        secretPresent: !!stripeWebhookSecret.value(),
      });

      // ⚠️ Important : utiliser req.rawBody pour la vérification de signature
      event = stripe.webhooks.constructEvent(
        req.rawBody,
        sig,
        stripeWebhookSecret.value(),
      );

      logger.info("✅ Signature valide, event construit", { type: event.type });
    } catch (err) {
      logger.error("❌ Webhook Stripe: signature invalide", {
        message: err.message,
        stack: err.stack,
      });
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    logger.info("📩 Webhook Stripe reçu et validé", { type: event.type });

    try {
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object;
          
          logger.info("💳 checkout.session.completed reçu", {
            sessionId: session.id,
            customer: session.customer,
            email: (session.customer_details && session.customer_details.email) || null,
            metadata: session.metadata,
            amount: session.amount_total,
            currency: session.currency,
          });

          // Récupérer l'UID depuis les metadata (attaché lors de createCheckoutSession)
          const uid = session.metadata && session.metadata.uid;
          
          if (!uid) {
            logger.warn("⚠️ UID manquant dans session.metadata", {
              sessionId: session.id,
              metadata: session.metadata,
            });
            break;
          }

          logger.info("🔑 UID extrait des metadata", { uid });

          // Marquer l'utilisateur comme premium dans Realtime Database
          const db = admin.database();
          const userRef = db.ref(`users/${uid}`);
          
          logger.info("📝 Mise à jour RTDB: membership...", { uid });

          await userRef.update({
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

          logger.info("✅ Membership mis à jour", { uid });

          // Attacher le produit COOKIE_PREMIUM
          const productRef = db.ref(`users/${uid}/products/COOKIE_PREMIUM`);
          
          logger.info("📝 Mise à jour RTDB: produit COOKIE_PREMIUM...", { uid });

          await productRef.set({
            acquired: true,
            acquiredAt: admin.database.ServerValue.TIMESTAMP,
            price: session.amount_total / 100, // Stripe envoie en centimes
            currency: session.currency,
            stripeSessionId: session.id,
          });

          logger.info("✅✅ Utilisateur marqué premium avec succès (webhook)", {
            uid,
            customer: session.customer,
            sessionId: session.id,
          });

          break;
        }

        case "payment_intent.payment_failed": {
          const pi = event.data.object;
          logger.warn("⚠️ payment_intent.payment_failed", {
            id: pi.id,
            reason: (pi.last_payment_error && pi.last_payment_error.message) || null,
            metadata: pi.metadata,
          });

          // TODO: loguer dans RTDB ou notifier si souhaité
          break;
        }

        default:
          logger.info("ℹ️ Event Stripe non géré explicitement", {
            type: event.type,
          });
      }

      res.json({ received: true });
    } catch (err) {
      logger.error("❌ Erreur interne lors du traitement du webhook", {
        message: err.message,
        stack: err.stack,
      });
      res.status(500).send("Internal error");
    }
  },
);
