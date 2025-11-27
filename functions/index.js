
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const { defineSecret } = require("firebase-functions/params");
const Stripe = require("stripe");

// 1) Secret Stripe (vient de Firebase Secret Manager, pas de functions.config())
const stripeSecret = defineSecret("STRIPE_SECRET_KEY");

// 2) Fonction callable : createCheckoutSession
exports.createCheckoutSession = onCall(
  { secrets: [stripeSecret] },
  async (request) => {
    logger.info("💳 createCheckoutSession appelée", {
      data: request.data || null,
    });

    // Exiger un utilisateur authentifié (Firebase Auth)
    if (!request.auth || !request.auth.uid) {
      throw new HttpsError("unauthenticated", "Utilisateur non authentifié");
    }

    const uid = request.auth.uid;
    const email = request.auth.token && request.auth.token.email ? request.auth.token.email : undefined;

    // Initialiser Stripe avec la clé sortie du secret
    const stripe = new Stripe(stripeSecret.value(), {
      apiVersion: "2024-06-20",
      maxNetworkRetries: 0,
    });

    try {
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: [
          {
            // Ton price_id Stripe (9 EUR)
            price: "price_1SXm7qFjMYughYGelI6oUFMo",
            quantity: 1,
          },
        ],
        // Lier la session à l'utilisateur
        client_reference_id: uid,
        customer_email: email,
        metadata: { uid },
        success_url: "http://localhost:5173/stripe-success",
        cancel_url: "http://localhost:5173/stripe-cancel",
      });

      logger.info("✅ Session Stripe créée", {
        sessionId: session.id,
        url: session.url,
      });

      // On renvoie simplement l’URL au front
      return { url: session.url };
    } catch (error) {
      logger.error("❌ Erreur Stripe lors de checkout.sessions.create", {
        message: error.message,
        type: error.type,
        code: error.code,
        raw: error.raw,
        stack: error.stack,
      });

      throw new HttpsError(
        "internal",
        error.message || "STRIPE_ERROR",
        {
          type: error.type,
          code: error.code,
        }
      );
    }
  }
);

// Brancher le webhook Stripe (gestion événements serveur à serveur)
exports.handleStripeWebhook = require("./stripeWebhooks").handleStripeWebhook;
