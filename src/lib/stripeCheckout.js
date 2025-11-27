// src/lib/stripeCheckout.js
import { httpsCallable } from "firebase/functions";
import { functions } from "../config/firebase"; // adapte le chemin si besoin

const createCheckoutSession = httpsCallable(functions, "createCheckoutSession");

export async function startStripeCheckout() {
  try {
    // Transmettre l'origine courante pour que le serveur construise les URLs de redirection
    const origin = window.location.origin;
    const result = await createCheckoutSession({ origin });
    const data = result.data;

    if (!data || !data.url) {
      console.error("Réponse inattendue de createCheckoutSession:", data);
      throw new Error((data && data.message) || "URL de session Stripe manquante");
    }

    // Redirection vers la page Stripe Checkout
    window.location.href = data.url;
  } catch (err) {
    console.error("Erreur checkout –", err);
    throw err;
  }
}
