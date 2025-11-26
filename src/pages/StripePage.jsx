import { useState } from 'react';
import { startStripeCheckout } from '../lib/stripeCheckout';

export default function StripePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleClick = async () => {
    setError(null);
    setLoading(true);
    try {
      await startStripeCheckout();
    } catch (e) {
      setError(e.message || 'Erreur inattendue');
      setLoading(false); // seulement si l'appel n'a pas redirigé
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Passer en mode Chef</h1>
      <button 
        onClick={handleClick} 
        disabled={loading} 
        style={{
          background:'#635bff',
          color:'#fff',
          padding:'0.75rem 1.25rem',
          border:'none',
          borderRadius:'6px',
          fontSize:'1rem',
          cursor: loading ? 'not-allowed' : 'pointer',
          boxShadow:'0 2px 6px rgba(0,0,0,0.15)'
        }}
      >
        {loading ? 'Redirection...' : 'Payer avec Stripe'}
      </button>
      {error && (
        <p style={{ color: 'red', marginTop: '1rem' }}>Erreur: {error}</p>
      )}
    </div>
  );
}
