// Imports nécessaires pour Firebase Functions et Stripe
const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const { defineSecret } = require("firebase-functions/params");
const Stripe = require("stripe");
const admin = require("firebase-admin");

// Initialise Firebase Admin si pas déjà fait
if (!admin.apps.length) {
  admin.initializeApp();
}

// Récupère les secrets depuis Firebase Secret Manager
// Ces secrets sont sécurisés et ne sont jamais visibles dans le code
const stripeSecret = defineSecret("STRIPE_SECRET_KEY");
const stripeWebhookSecret = defineSecret("STRIPE_WEBHOOK_SECRET");

/**
 * Fonction Cloud pour recevoir et vérifier les webhooks Stripe
 * Appelée automatiquement par Stripe après chaque événement de paiement
 */
exports.handleStripeWebhook = onRequest(
  {
    region: "us-central1", // Région du serveur
    secrets: [stripeSecret, stripeWebhookSecret], // Secrets requis
    maxInstances: 1, // Une seule instance pour éviter les doublons
  },
  async (req, res) => {
    // ÉTAPE 1 : Log des informations de la requête reçue
    logger.info("➡️ Webhook Stripe reçu", {
      method: req.method, // Devrait être POST
      contentType: req.headers["content-type"], // application/json
      hasRawBody: !!req.rawBody, // Vérifie si rawBody existe
      rawIsBuffer: Buffer.isBuffer(req.rawBody), // Vérifie si c'est bien un Buffer
      rawLength: req.rawBody ? req.rawBody.length : 0, // Taille en bytes
    });

    // ÉTAPE 2 : Vérifie que c'est bien une requête POST
    if (req.method !== "POST") {
      return res.status(405).send("Method Not Allowed");
    }

    // ÉTAPE 3 : Récupère la signature Stripe dans les headers
    // Cette signature permet de vérifier que la requête vient bien de Stripe
    const signature = req.headers["stripe-signature"];
    if (!signature) {
      logger.warn("⚠️ Stripe-Signature header manquant");
      return res.status(400).send("Missing Stripe-Signature header");
    }

    // ÉTAPE 4 : Récupère le secret webhook depuis Firebase
    const webhookSecret = stripeWebhookSecret.value();

    // 🧪 DEBUG : Affiche les premiers et derniers caractères du secret
    // pour vérifier qu'on utilise le bon secret (whsec_KZPh84h2...)
    logger.info("🧪 DEBUG webhook secret", {
      prefix: webhookSecret.slice(0, 8), // whsec_KZ
      suffix: webhookSecret.slice(-4), // ...v7vV
      length: webhookSecret.length, // Devrait être ~40 caractères
    });

    // ÉTAPE 5 : Vérification cryptographique de la signature
    let event;
    try {
      // Initialise le client Stripe avec la clé API
      const stripe = new Stripe(stripeSecret.value(), {
        apiVersion: "2024-06-20",
      });

      // CRITIQUE : Vérifie que la requête vient bien de Stripe
      // Si la signature ne correspond pas, lance une erreur
      event = stripe.webhooks.constructEvent(
        req.rawBody,      // Le corps de la requête en Buffer brut (important!)
        signature,        // La signature Stripe
        webhookSecret     // Notre secret webhook (whsec_...)
      );

      // Si on arrive ici, la signature est valide ✅
      logger.info("✅ Webhook Stripe vérifié", {
        type: event.type, // Type d'événement (checkout.session.completed, etc.)
        id: event.id,     // ID unique de l'événement
      });
    } catch (err) {
      // Si la signature est invalide, on rejette la requête
      logger.error("❌ Vérification de signature échouée", {
        error: err.message,
      });
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // ÉTAPE 6 : Traitement des événements métier
    try {
      // Connexion à la Realtime Database
      const db = admin.database();

      // Switch selon le type d'événement Stripe
      switch (event.type) {
        // CAS 1 : Paiement réussi via Checkout
        case "checkout.session.completed": {
          const session = event.data.object; // Données de la session Stripe
          const uid = session.metadata && session.metadata.uid; // ID utilisateur

          // Si pas d'UID, on ne peut pas identifier l'utilisateur
          if (!uid) {
            logger.warn("⚠️ UID manquant dans metadata", {
              sessionId: session.id,
            });
            break;
          }

          logger.info("💳 Paiement SUCCESS", { uid, sessionId: session.id });

          // Met à jour le membership de l'utilisateur dans RTDB
          await db.ref(`users/${uid}`).update({
            membership: {
              active: true,        // Activation du membership
              status: "active",    // Statut actif
              tier: "premium",     // Tier premium
              step: 1,             // Étape 1 du parcours
              since: admin.database.ServerValue.TIMESTAMP, // Timestamp serveur
              stripeCustomerId: session.customer || null,  // ID client Stripe
              stripeSessionId: session.id,                 // ID session
            },
            updatedAt: admin.database.ServerValue.TIMESTAMP,
          });

          // Ajoute le produit COOKIE_PREMIUM à l'utilisateur
          await db.ref(`users/${uid}/products/COOKIE_PREMIUM`).set({
            acquired: true,      // Produit acquis
            acquiredAt: admin.database.ServerValue.TIMESTAMP,
            price: session.amount_total / 100, // Montant en euros (Stripe envoie en centimes)
            currency: session.currency,        // Devise (eur)
            stripeSessionId: session.id,
          });

          break;
        }

        // CAS 2 : PaymentIntent réussi (optionnel, pour info)
        case "payment_intent.succeeded": {
          const intent = event.data.object;
          const uid = intent.metadata && intent.metadata.uid;
          
          if (uid) {
            logger.info("✅ Payment Intent succeeded", { uid });
          }
          break;
        }

        // CAS 3 : Paiement échoué
        case "payment_intent.payment_failed": {
          const intent = event.data.object;
          const uid = intent.metadata && intent.metadata.uid;

          if (!uid) {
            logger.warn("⚠️ UID manquant dans payment_intent.payment_failed");
            break;
          }

          logger.info("💥 Paiement FAILED", { uid, type: event.type });

          // Désactive le membership en cas d'échec
          await db.ref(`users/${uid}`).update({
            membership: {
              active: false,       // Membership non actif
              status: "failed",    // Statut failed
              lastErrorEvent: event.type,
              lastErrorAt: admin.database.ServerValue.TIMESTAMP,
            },
            updatedAt: admin.database.ServerValue.TIMESTAMP,
          });

          break;
        }

        // Par défaut : événements non gérés
        default:
          logger.info("ℹ️ Event Stripe non géré", { type: event.type });
      }

      // Répond à Stripe que le webhook a été reçu
      return res.json({ received: true });
    } catch (err) {
      // Erreur lors de l'écriture dans RTDB
      logger.error("❌ Erreur métier RTDB", { error: err.message });
      return res.status(500).send("Internal Error");
    }
  }
);
