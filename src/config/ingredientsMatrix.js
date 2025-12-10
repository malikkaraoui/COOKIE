const defaultDescription = (tokenName) => `Ingrédient inspiré de ${tokenName}.`;

export const INGREDIENT_FREQUENCIES = [
  { id: 'omnipresent', label: 'omniprésent', tone: 'success' },
  { id: 'tres_frequent', label: 'très fréquent', tone: 'info' },
  { id: 'frequent', label: 'fréquent', tone: 'muted' },
  { id: 'occasionnel', label: 'occasionnel', tone: 'warning' },
]

const selectionKeyForIngredient = (ingredient) => `${ingredient.tokenSymbol}:${ingredient.provider}`

const BASE_INGREDIENTS = {
  BTC: {
    label: 'Pain',
    code: 'I04',
    category: 'ETF actions Monde',
    description: 'Toujours sur la table = cœur actions globales moderne.',
    note: 'Base versatile pour toutes les recettes.',
    emoji: '🥖',
    frequency: 'omnipresent',
    tier: 'free',
  },
  ETH: {
    label: 'Beurre',
    code: 'I06',
    category: 'ETF / actions à dividende',
    description: 'Donne du "gras" et du confort = flux réguliers.',
    note: 'Accompagne toutes les préparations long terme.',
    emoji: '🧈',
    frequency: 'omnipresent',
    tier: 'free',
  },
  SOL: {
    label: 'Sel',
    code: 'I22',
    category: 'Poche cash tactique (2-5%)',
    description: 'Présent partout en petite dose pour ajuster l’assaisonnement.',
    note: 'Idéal pour pivots rapides sur layer 1.',
    emoji: '🧂',
    frequency: 'omnipresent',
    tier: 'free',
  },
  BNB: {
    label: 'Huile d’olive',
    code: 'I11',
    category: 'Poche rendement stable',
    description: 'Apporte de la fluidité, chauffe vite sans brûler.',
    note: 'Supporte tout l’écosystème BSC.',
    emoji: '🫒',
    frequency: 'omnipresent',
    tier: 'free',
  },
  POL: {
    label: 'Farine',
    code: 'I08',
    category: 'Infra L2 polyvalente',
    description: 'Donne de la consistance quand on mélange plusieurs recettes.',
    note: 'Support multi-applications Polygon.',
    emoji: '🌾',
    frequency: 'tres_frequent',
    tier: 'free',
  },
  kPEPE: {
    label: 'Piment doux',
    code: 'I27',
    category: 'Meme spice',
    description: 'Ajoute un kick fun sans anesthésier la bouche.',
    note: 'Micro-dose pour booster la narration.',
    emoji: '🌶️',
    frequency: 'occasionnel',
    tier: 'premium',
  },
  AVAX: {
    label: 'Basilic',
    code: 'I14',
    category: 'Arômes multi-chaînes',
    description: 'Parfume instantanément, même en faible quantité.',
    note: 'Bonne odeur de subnets.',
    emoji: '🌿',
    frequency: 'frequent',
    tier: 'free',
  },
  ATOM: {
    label: 'Bouillon maison',
    code: 'I18',
    category: 'Infra interopérable',
    description: 'Donne du relief à toutes les soupes décentralisées.',
    note: 'Hub Cosmos, base aromatique.',
    emoji: '🍲',
    frequency: 'frequent',
    tier: 'free',
  },
  APT: {
    label: 'Poivre blanc',
    code: 'I23',
    category: 'L1 dynamique',
    description: 'Ajoute du nerf en petite poche de risque supplémentaire.',
    note: 'À utiliser moulu minute.',
    emoji: '🧂',
    frequency: 'tres_frequent',
    tier: 'premium',
  },
  ARB: {
    label: 'Fromage affiné',
    code: 'I29',
    category: 'Yield modulable',
    description: 'Apporte de la profondeur umami aux recettes DeFi.',
    note: 'Mature bien avec les incentives.',
    emoji: '🧀',
    frequency: 'frequent',
    tier: 'free',
  },
  DOGE: {
    label: 'Sauce piquante',
    code: 'B02',
    category: 'Meme liquide',
    description: 'Donne du show, mais à manier avec précaution.',
    note: 'Toujours prévoir un extincteur.',
    emoji: '🌶️',
    frequency: 'occasionnel',
    tier: 'free',
  },
  SHIB: {
    label: 'Graines de sésame',
    code: 'B05',
    category: 'Micro-épice communautaire',
    description: 'Parsemez pour un visuel crunchy.',
    note: 'Volume massif, coût mini.',
    emoji: '🌰',
    frequency: 'frequent',
    tier: 'free',
  },
  PEPE: {
    label: 'Cornichons',
    code: 'B07',
    category: 'Pickles spéculatifs',
    description: 'Acidité immédiate = hype instantanée.',
    note: 'À sortir lors des builds memes.',
    emoji: '🥒',
    frequency: 'occasionnel',
    tier: 'premium',
  },
  LINK: {
    label: 'Bouquet garni',
    code: 'B11',
    category: 'Oracles & data',
    description: 'Relie toutes les saveurs entre elles.',
    note: 'Indispensable aux sauces complexes.',
    emoji: '🌿',
    frequency: 'tres_frequent',
    tier: 'free',
  },
  DOT: {
    label: 'Pâtes fraîches',
    code: 'B13',
    category: 'Multi-chaîne modulaire',
    description: 'Capte toutes les sauces qu’on lui propose.',
    note: 'Demande un peu de cuisson.',
    emoji: '🍝',
    frequency: 'frequent',
    tier: 'free',
  },
  UNI: {
    label: 'Levure',
    code: 'B15',
    category: 'AMM / DeFi',
    description: 'Fait gonfler la pâte de liquidité.',
    note: 'À doser pour éviter la surchauffe.',
    emoji: '🧫',
    frequency: 'frequent',
    tier: 'premium',
  },
  RUNE: {
    label: 'Charbon ardent',
    code: 'B17',
    category: 'Liquidity cross-chain',
    description: 'Allume les barbecues inter-chaînes.',
    note: 'Fort en bouche.',
    emoji: '🔥',
    frequency: 'occasionnel',
    tier: 'premium',
  },
  INJ: {
    label: 'Truffe noire',
    code: 'B18',
    category: 'Perp haute couture',
    description: 'Rare, élève immédiatement la note gourmet.',
    note: 'Réservé aux chefs confirmés.',
    emoji: '🍄',
    frequency: 'occasionnel',
    tier: 'premium',
  },
  ATOM_BINANCE: {
    label: 'Herbes de Provence',
    code: 'B21',
    category: 'Interchain seasoning',
    description: 'Diffuse un parfum cosmique constant.',
    note: 'Fonctionne même à faible dose.',
    emoji: '🌿',
    frequency: 'frequent',
    tier: 'free',
  },
  APT_BINANCE: {
    label: 'Citron confit',
    code: 'B22',
    category: 'Layer 1 acidulé',
    description: 'Apporte de l’acidité pour réveiller une assiette.',
    note: 'Coupe le gras d’un portefeuille trop value.',
    emoji: '🍋',
    frequency: 'tres_frequent',
    tier: 'free',
  },
  ARB_BINANCE: {
    label: 'Comté 24 mois',
    code: 'B23',
    category: 'Layer 2 premium',
    description: 'Saveur profonde, se râpe sur tout.',
    note: 'Demande du temps pour révéler ses arômes.',
    emoji: '🧀',
    frequency: 'frequent',
    tier: 'premium',
  },
  OP: {
    label: 'Crème fraîche',
    code: 'B24',
    category: 'Layer 2 convivial',
    description: 'Lie la sauce et arrondit les bords.',
    note: 'Idéal pour démocratiser une recette.',
    emoji: '🥛',
    frequency: 'frequent',
    tier: 'free',
  },
  SEI: {
    label: 'Poisson séché',
    code: 'B25',
    category: 'Infra trading haute fréquence',
    description: 'Donne un umami précis pour flux rapides.',
    note: 'Sert de base aux sushis de liquidité.',
    emoji: '🐟',
    frequency: 'occasionnel',
    tier: 'premium',
  },
  TIA: {
    label: 'Noix grillées',
    code: 'B26',
    category: 'Data availability',
    description: 'Ajoute du croquant aux layers supérieurs.',
    note: 'Bonne odeur en sortie de four.',
    emoji: '🥜',
    frequency: 'frequent',
    tier: 'free',
  },
  LTC: {
    label: 'Sel fumé',
    code: 'B27',
    category: 'Old school seasoning',
    description: 'Donne une touche rétro aux plats modernes.',
    note: 'Indémodable.',
    emoji: '🧂',
    frequency: 'occasionnel',
    tier: 'free',
  },
  BCH: {
    label: 'Sucre roux',
    code: 'B28',
    category: 'Fork caramélisé',
    description: 'Ajoute un côté nostalgique aux desserts crypto.',
    note: 'À utiliser avec modération.',
    emoji: '🍬',
    frequency: 'occasionnel',
    tier: 'free',
  },
  ORDI: {
    label: 'Saké',
    code: 'B29',
    category: 'Narrative ordinals',
    description: 'Fait tourner la tête, mais ouvre de nouveaux mondes.',
    note: 'À servir bien frais.',
    emoji: '🍶',
    frequency: 'occasionnel',
    tier: 'premium',
  },
  JUP: {
    label: 'Sirop maison',
    code: 'B30',
    category: 'Airdrop mixer',
    description: 'Caramélise tous les cocktails Solana.',
    note: 'Sucré mais puissant.',
    emoji: '🍯',
    frequency: 'tres_frequent',
    tier: 'free',
  },
  CAKE: {
    label: 'Pâtisserie',
    code: 'B31',
    category: 'DeFi BSC',
    description: 'Dessert signature pour conclure une recette.',
    note: 'À réserver au tea time Binance.',
    emoji: '🍰',
    frequency: 'occasionnel',
    tier: 'premium',
  }
}

const hyperliquidSymbols = ['BTC','ETH','SOL','BNB','POL','kPEPE','AVAX','ATOM','APT','ARB']

const binanceSymbols = [
  'BTC','ETH','BNB','SOL','XRP','ADA','TON','TRX','AVAX','DOGE','SHIB','PEPE','LINK','DOT','POL','UNI','RUNE','INJ','ATOM','SUI','APT','ARB','OP','SEI','TIA','LTC','BCH','ORDI','JUP','CAKE'
]

const buildIngredient = (symbol, provider) => {
  const key = provider === 'binance' && BASE_INGREDIENTS[`${symbol}_BINANCE`]
    ? `${symbol}_BINANCE`
    : symbol
  const base = BASE_INGREDIENTS[key] || {}
  return {
    tokenSymbol: symbol,
    provider,
    label: base.label || `${symbol} spécial` ,
    code: base.code || `${provider === 'hyperliquid' ? 'I' : 'B'}${symbol.charCodeAt(0) % 90}`,
    category: base.category || `${symbol} category`,
    description: base.description || defaultDescription(symbol),
    note: base.note || 'Assaisonnement encore en test.',
    emoji: base.emoji || '🍽️',
    frequency: base.frequency || 'frequent',
    tier: base.tier || 'premium',
  }
}

const RAW_INGREDIENTS = [
  ...hyperliquidSymbols.map((symbol) => buildIngredient(symbol, 'hyperliquid')),
  ...binanceSymbols.map((symbol) => buildIngredient(symbol, 'binance')),
]

const hyperliquidFreeKeys = new Set(
  RAW_INGREDIENTS
    .filter((ingredient) => ingredient.provider === 'hyperliquid' && ingredient.frequency === 'omnipresent')
    .slice(0, 4)
    .map(selectionKeyForIngredient),
)

const binanceFreeKeys = new Set(
  RAW_INGREDIENTS
    .filter((ingredient) => ingredient.provider === 'binance' && ingredient.frequency === 'tres_frequent')
    .slice(0, 5)
    .map(selectionKeyForIngredient),
)

const FREE_SELECTION_KEYS = new Set([...hyperliquidFreeKeys, ...binanceFreeKeys])

export const INGREDIENTS = RAW_INGREDIENTS.map((ingredient) => {
  const key = selectionKeyForIngredient(ingredient)
  const tier = FREE_SELECTION_KEYS.has(key) ? 'free' : 'premium'
  return { ...ingredient, tier }
})

export function getIngredientStats() {
  const total = INGREDIENTS.length
  const free = INGREDIENTS.filter(i => i.tier === 'free').length
  const premium = INGREDIENTS.filter(i => i.tier === 'premium').length
  return { total, free, premium }
}

export function groupIngredientsByProvider(filterTier = 'all') {
  const filtered = INGREDIENTS.filter((ingredient) => {
    if (filterTier === 'all') return true
    return ingredient.tier === filterTier
  })
  return filtered.reduce((acc, ingredient) => {
    const providerKey = ingredient.provider
    if (!acc[providerKey]) {
      acc[providerKey] = {}
    }
    if (!acc[providerKey][ingredient.frequency]) {
      acc[providerKey][ingredient.frequency] = []
    }
    acc[providerKey][ingredient.frequency].push(ingredient)
    return acc
  }, {})
}
