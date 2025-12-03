// Configuration centralisée des tokens supportés
// Utilisé par MarketDataContext pour polling API et cache Firebase

export const TOKENS = [
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    color: '#F7931A',
    decimals: 2,
    source: 'hyperliquid'
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    color: '#627EEA',
    decimals: 2,
    source: 'hyperliquid'
  },
  {
    symbol: 'SOL',
    name: 'Solana',
    color: '#14F195',
    decimals: 2,
    source: 'hyperliquid'
  },
  {
    symbol: 'BNB',
    name: 'BNB',
    color: '#F3BA2F',
    decimals: 2,
    source: 'hyperliquid'  // BNB depuis Hyperliquid pour page1
  },
  {
    symbol: 'POL',
    name: 'Polygon (POL)',
    color: '#8247E5',
    decimals: 2,
    source: 'hyperliquid',
    aliases: ['MATIC']
  },
  {
    symbol: 'kPEPE',
    name: 'Pepe',
    color: '#3D9970',
    decimals: 2,
    source: 'hyperliquid'
  },
  {
    symbol: 'AVAX',
    name: 'Avalanche',
    color: '#E84142',
    decimals: 2,
    source: 'hyperliquid'
  },
  {
    symbol: 'ATOM',
    name: 'Cosmos',
    color: '#2E3148',
    decimals: 2,
    source: 'hyperliquid'
  },
  {
    symbol: 'APT',
    name: 'Aptos',
    color: '#00D4AA',
    decimals: 2,
    source: 'hyperliquid'
  },
  {
    symbol: 'ARB',
    name: 'Arbitrum',
    color: '#28A0F0',
    decimals: 2,
    source: 'hyperliquid'
  }
]

// Helper : récupérer config d'un token par symbole
const TOKEN_CANONICAL_LOOKUP = TOKENS.reduce((acc, token) => {
  acc[token.symbol.toUpperCase()] = token.symbol
  if (Array.isArray(token.aliases)) {
    token.aliases.forEach((alias) => {
      acc[alias.toUpperCase()] = token.symbol
    })
  }
  return acc
}, {})

export function normalizeHyperliquidSymbol(symbol) {
  const normalized = typeof symbol === 'string' ? symbol.trim().toUpperCase() : ''
  if (!normalized) {
    return ''
  }
  return TOKEN_CANONICAL_LOOKUP[normalized] || normalized
}

export function getTokenConfig(symbol) {
  const canonical = normalizeHyperliquidSymbol(symbol)
  return TOKENS.find(t => t.symbol === canonical)
}

// Helper : liste des symboles pour requête API
export function getTokenSymbols() {
  return TOKENS.map(t => t.symbol)
}

// Helper : liste des symboles Hyperliquid uniquement
export function getHyperliquidTokenSymbols() {
  return TOKENS.filter(t => t.source === 'hyperliquid').map(t => t.symbol)
}

// Helper : liste des symboles BSC uniquement
export function getBscTokenSymbols() {
  return TOKENS.filter(t => t.source === 'bsc').map(t => t.symbol)
}
