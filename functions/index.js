
const functionsV1 = require("firebase-functions/v1");
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const { defineSecret } = require("firebase-functions/params");
const Stripe = require("stripe");
const admin = require("firebase-admin");

if (!admin.apps.length) {
  admin.initializeApp();
}

const CONTACT_INFO_POLICY = {
  LEGACY: "legacy",
  MANDATORY_V1: "mandatory-v1",
};

const extractFirstName = (displayName = "") => {
  const parts = displayName.trim().split(" ").filter(Boolean);
  return parts[0] || "";
};

const extractLastName = (displayName = "") => {
  const parts = displayName.trim().split(" ").filter(Boolean);
  if (parts.length <= 1) return "";
  return parts.slice(1).join(" ");
};

exports.bootstrapUserProfile = functionsV1.auth.user().onCreate(async (user) => {
  if (!user || !user.uid) {
    logger.warn("[bootstrapUserProfile] Event sans UID");
    return;
  }

  const uid = user.uid;
  const now = Date.now();
  const userRef = admin.database().ref(`users/${uid}`);

  try {
    const snapshot = await userRef.get();
    const names = {
      firstName: extractFirstName(user.displayName || ""),
      lastName: extractLastName(user.displayName || ""),
    };

    if (snapshot.exists()) {
      await userRef.update({
        ...names,
        photoURL: user.photoURL || null,
        lastLoginAt: now,
        updatedAt: now,
      });
      logger.info("[bootstrapUserProfile] Profil déjà existant mis à jour", { uid });
      return;
    }

    await userRef.set({
      email: user.email || "",
      ...names,
      photoURL: user.photoURL || null,
      birthDate: null,
      authProvider: user.providerData?.[0]?.providerId || "google",
      createdAt: now,
      updatedAt: now,
      lastLoginAt: now,
      isActive: true,
      contactInfoCompleted: false,
      contactInfoPolicyVersion: CONTACT_INFO_POLICY.MANDATORY_V1,
    });

    logger.info("[bootstrapUserProfile] Nouveau profil créé", { uid });
  } catch (error) {
    logger.error("[bootstrapUserProfile] Échec de création du profil", {
      uid,
      error: error.message,
    });
  }
});

exports.createWalletCustomToken = require("./auth/createWalletCustomToken").createWalletCustomToken;

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

    logger.info("📋 Création session Stripe", {
      uid,
      email,
      hasAuth: !!request.auth,
    });

    // Initialiser Stripe avec la clé sortie du secret
    const stripe = new Stripe(stripeSecret.value(), {
      apiVersion: "2024-06-20",
      maxNetworkRetries: 0,
    });

    try {
      // Déterminer l'origine renvoyée par le client (pour éviter les soucis de port 5173/5174)
      // Fallback sur 5173 en local si non fourni
      const origin = request.data && request.data.origin ? String(request.data.origin) : "http://localhost:5173";

      const successUrl = origin.replace(/\/$/, "") + "/stripe-success";
      const cancelUrl = origin.replace(/\/$/, "") + "/stripe-cancel";

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
        success_url: successUrl,
        cancel_url: cancelUrl,
      });

      logger.info("✅ Session Stripe créée", {
        sessionId: session.id,
        url: session.url,
        metadata: session.metadata,
        client_reference_id: session.client_reference_id,
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

// Chargement dynamique des fonctions TypeScript Hyperliquid
require("ts-node").register({
  transpileOnly: true,
  project: require("path").join(__dirname, "tsconfig.json"),
});

const {
  placeTestOrder,
  listOpenOrders,
  closeAllPositions,
  placeBinanceSpotOrder,
  listBinanceOpenOrders,
  listBinanceSpotBalances,
  cancelBinanceOpenOrdersOnSymbol,
  cancelAllBinanceOpenOrders,
  closeAndDustBinancePositions,
  watchHyperliquidFunding,
  maybeOpenFundingPosition,
  maybeCloseFundingPosition,
  runFundingStrategyTick,
  getFundingStrategyState,
  upsertFundingStrategyState,
  fundingMetrics,
} = require("./src/index");

exports.placeTestOrder = placeTestOrder;
exports.listOpenOrders = listOpenOrders;
exports.closeAllPositions = closeAllPositions;
exports.placeBinanceSpotOrder = placeBinanceSpotOrder;
exports.listBinanceOpenOrders = listBinanceOpenOrders;
exports.listBinanceSpotBalances = listBinanceSpotBalances;
exports.cancelBinanceOpenOrdersOnSymbol = cancelBinanceOpenOrdersOnSymbol;
exports.cancelAllBinanceOpenOrders = cancelAllBinanceOpenOrders;
exports.closeAndDustBinancePositions = closeAndDustBinancePositions;
exports.watchHyperliquidFunding = watchHyperliquidFunding;
exports.maybeOpenFundingPosition = maybeOpenFundingPosition;
exports.maybeCloseFundingPosition = maybeCloseFundingPosition;
exports.runFundingStrategyTick = runFundingStrategyTick;
exports.getFundingStrategyState = getFundingStrategyState;
exports.upsertFundingStrategyState = upsertFundingStrategyState;
exports.fundingMetrics = fundingMetrics;
