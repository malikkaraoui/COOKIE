# 🎨 UI Components - COOKIE

## 🎯 Hooks interactifs

## ⚠️ Hyperliquid – Formulaire d’ordres (Ma Cuisine)

- Composant : `src/pages/page2.jsx`
- Helpers clefs : `computeAutoSize`, `quantizeSize`, `TOKEN_SIZE_DECIMALS`

### Règle à ne jamais oublier

Chaque token Hyperliquid impose un nombre de décimales maximum pour la taille (`szDecimals` retourné par `POST /info` → `meta`).

> 🔴 **Si tu ajoutes un nouveau token Hyperliquid dans `tokenList.js`, tu dois aussi l’ajouter dans `TOKEN_SIZE_DECIMALS` avec son `szDecimals`.**

Sinon, la taille auto/manuel sera rejetée par Hyperliquid (`Order has invalid size`).

### Procédure rapide

1. Récupérer la valeur `szDecimals` via `scripts/update-hyperliquid-tokens.js` ou un curl `POST /info {"type":"meta"}`.
2. Ajouter/mettre à jour l’entrée correspondante dans `TOKEN_SIZE_DECIMALS` (fallback = 4 mais à éviter).
3. Vérifier que `computeAutoSize` renvoie une taille ≥ 15 USDC puis arrondit avec `quantizeSize(symbol, rawSize, 'ceil')`.
4. Lancer `npm run lint` et tester un ordre sur Hyperliquid pour confirmer.

> 🧠 Astuce : si un token change de précision côté Hyperliquid, mettre la table à jour avant toute modification du frontend pour éviter les 500.

### `useHover` Hook

Hook simple pour détecter le survol d'un élément.

**Emplacement** : `src/hooks/useHover.js`

#### Utilisation basique

```javascript
import { useHover } from '../hooks/useHover'

function MyComponent() {
  const { isHovered, hoverHandlers } = useHover()
  
  return (
    <div 
      {...hoverHandlers}
      style={{ opacity: isHovered ? 1 : 0.7 }}
    >
      Survolez-moi !
    </div>
  )
}
```

### `useButtonHover` Hook

Hook pré-configuré pour boutons avec styles automatiques.

#### Configuration

```javascript
const { isHovered, hoverHandlers, buttonStyle } = useButtonHover({
  baseColor: '#6f5a72',                      // Couleur de base
  hoverColor: '#8b7490',                     // Couleur au survol
  baseBackground: 'transparent',             // Background de base
  hoverBackground: 'rgba(111, 90, 114, 0.1)', // Background au survol
  transition: 'all 0.2s ease',               // Transition CSS
})
```

#### Exemples d'utilisation

**LoginButton (Topbar)** :
```jsx
const { hoverHandlers, buttonStyle } = useButtonHover({
  baseColor: '#ffffff',
  hoverColor: '#e5e7eb',
  baseBackground: 'rgba(255, 255, 255, 0.1)',
  hoverBackground: 'rgba(255, 255, 255, 0.2)',
})

<button style={buttonStyle} {...hoverHandlers}>
  Connexion avec Google
</button>
```

**LogoutButton (Sidebar)** :
```jsx
const { hoverHandlers, buttonStyle } = useButtonHover({
  baseColor: '#ef4444',
  hoverColor: '#dc2626',
  baseBackground: 'transparent',
  hoverBackground: 'rgba(239, 68, 68, 0.1)',
})

<button style={buttonStyle} {...hoverHandlers}>
  Déconnexion
</button>
```

**ProfileButton (Sidebar)** :
```jsx
const { hoverHandlers, buttonStyle } = useButtonHover({
  baseColor: '#6f5a72',
  hoverColor: '#8b7490',
  baseBackground: 'transparent',
  hoverBackground: 'rgba(111, 90, 114, 0.1)',
})

<Link style={buttonStyle} {...hoverHandlers}>
  Profil
</Link>
```

#### Retour du hook

| Propriété | Type | Description |
|-----------|------|-------------|
| `isHovered` | `boolean` | État du survol |
| `hoverHandlers` | `object` | `{ onMouseEnter, onMouseLeave }` à spread |
| `buttonStyle` | `object` | Styles CSS calculés automatiquement |

---

## 📐 Composants redimensionnables

### `useResizablePanel` Hook

Hook réutilisable pour panneaux redimensionnables avec support drag et double-clic.

**Emplacement** : `src/hooks/useResizablePanel.js`

#### Configuration

```javascript
const { size, isResizing, startResizing, handleDoubleClick } = useResizablePanel({
  min: 80,           // Taille minimale (px)
  max: 200,          // Taille maximale (px)
  initial: 100,      // Taille initiale (px)
  axis: 'y'          // 'x' = largeur, 'y' = hauteur
})
```

#### Fonctionnalités

| Interaction | Comportement |
|------------|--------------|
| **Drag simple** | Redimensionne entre `min` et `max` |
| **Double-clic** | Toggle min/max |
| **isResizing** | État pour styling actif |

#### Exemples d'utilisation

**Topbar (axe Y)** :
```jsx
const { size: height, isResizing, startResizing, handleDoubleClick } = useResizablePanel({
  min: 60,
  max: 250,
  initial: 150,
  axis: 'y'
})

<header className="topbar" style={{ height }}>...</header>
<div 
  className={`topbar-resizer ${isResizing ? 'is-resizing' : ''}`}
  onMouseDown={startResizing}
  onDoubleClick={handleDoubleClick}
/>
```

**Sidebar (axe X)** :
```jsx
const { size: width, isResizing, startResizing, handleDoubleClick } = useResizablePanel({
  min: 110,
  max: 420,
  initial: 200,
  axis: 'x'
})

<nav className="sidebar" style={{ width }}>...</nav>
<div 
  className={`sidebar-resizer ${isResizing ? 'is-resizing' : ''}`}
  onMouseDown={startResizing}
  onDoubleClick={handleDoubleClick}
/>
```

---

## 🧭 Sidebar

**Emplacement** : `src/components/Sidebar.jsx`

### Architecture

```
┌─────────────────────┐
│ Sidebar (100vh)     │
├─────────────────────┤
│ .scrollable-links   │ ← Scroll si > hauteur
│  - Marmiton         │
│  - Ma cuisine       │
│  - Binance          │
├─────────────────────┤
│ .sidebar-footer     │ ← Fixe en bas
│  - Profil           │
│  - Déconnexion      │
└─────────────────────┘
```

### Hauteur dynamique

La sidebar calcule automatiquement sa hauteur en fonction de la topbar :

```javascript
// Hauteur = 100vh - topbar - topbar-resizer
const [sidebarHeight, setSidebarHeight] = useState('calc(100vh - 156px)')

// ResizeObserver pour updates automatiques
useEffect(() => {
  const observer = new ResizeObserver(updateHeight)
  observer.observe(topbar)
  return () => observer.disconnect()
}, [])
```

**Résultat** : Boutons Profil/Déconnexion toujours visibles en bas de l'écran, même avec beaucoup de tokens.

### Mode Compact

Si `width < 160px` :
- Icônes seules (texte masqué)
- Badge count en point vert
- Centrage des éléments

### Drag & Drop

- **Zone drop** : "Ma cuisine" avec animation shake
- **Validation** : Authentification requise
- **Limite** : 4 tokens max avec badge `{count}/4`

---

## 🎯 TokenTile

**Emplacement** : `src/elements/TokenTile.jsx`

### Props

```jsx
<TokenTile 
  symbol="BTC"              // Symbole du token
  source="hyperliquid"      // 'hyperliquid' | 'binance'
  draggable={true}          // Active/désactive le drag (défaut: false)
/>
```

### Comportement selon la page

| Page | draggable | Comportement |
|------|-----------|--------------|
| **Marmiton** (page1) | `true` | Draggable vers Ma cuisine |
| **Ma cuisine** (page2) | `false` | Suppression par croix rouge uniquement |
| **Binance** (page4) | Card custom | Drag géré manuellement |

### Format de prix

```javascript
// Prix < $0.01 → 6 décimales (ex: kPEPE)
// Prix < $1 → 4 décimales
// Prix < $100 → 2 décimales
// Prix >= $100 → 0 décimale
```

---

## 🔄 Resizers (Poignées de redimensionnement)

### CSS Classes

```css
.sidebar-resizer {
  width: 6px;
  cursor: col-resize;
  background: rgba(0, 0, 0, 0.05);
  transition: background 0.15s ease;
  flex-shrink: 0;
  z-index: 10;
}

.topbar-resizer {
  height: 6px;
  cursor: row-resize;
  background: rgba(0, 0, 0, 0.05);
  transition: background 0.15s ease;
}

.is-resizing {
  background: rgba(0, 0, 0, 0.18);
}
```

### Interactions

| Action | Résultat |
|--------|----------|
| **Hover** | Background plus sombre |
| **Drag** | Redimensionne en temps réel |
| **Double-clic** | Toggle min ↔ max |
| **Release** | `isResizing = false` |

---

## 📦 Icônes (Lucide React)

**Librairie** : `lucide-react`

### Icônes utilisées

```jsx
import { Users, ChefHat, Coins } from 'lucide-react'

// Marmiton Communautaire → Users
// Ma cuisine → ChefHat  
// Binance → Coins
```

### Rendu

```jsx
<Icon size={20} strokeWidth={2} />
```

**Avantages** :
- SVG optimisés (tree-shakable)
- Cohérence visuelle
- Support TypeScript natif

---

## 🎨 Charte couleurs

```javascript
const colors = {
  // Backgrounds
  topbar: '#6f5a72',
  sidebar: '#e7cfcf',
  page: '#e4b85a',
  
  // UI
  navLinkActive: '#6f5a72',
  navLinkHover: 'rgba(0, 0, 0, 0.06)',
  
  // Status
  positive: '#22c55e',
  negative: '#ef4444',
  neutral: '#94a3b8',
  
  // Tokens (30 couleurs custom)
  BTC: '#F7931A',
  ETH: '#627EEA',
  BNB: '#F3BA2F',
  SOL: '#14F195',
  // ... voir page4.jsx
}
```

---

## 📱 Responsive

### Breakpoints

```javascript
// Sidebar
width < 160px → Mode compact (icônes seules)
width >= 160px → Mode normal (icône + texte)

// Limites redimensionnement
Sidebar: 110px - 420px
Topbar: 60px - 250px
```

### Layout adaptatif

```css
.app {
  height: 100vh;           /* Hauteur fixe écran */
  overflow: hidden;        /* Pas de scroll global */
}

.layout {
  flex: 1;
  overflow: hidden;
}

.page {
  overflow-y: auto;        /* Scroll indépendant */
}
```

---

## ✅ Checklist UI

- [ ] Sidebar : Hauteur = `calc(100vh - topbar - resizer)`
- [ ] Sidebar : Footer fixe en bas (`.sidebar-footer`)
- [ ] Sidebar : Scroll uniquement sur `.scrollable-links`
- [ ] Resizers : `onDoubleClick` pour toggle min/max
- [ ] TokenTile : `draggable={false}` dans Ma cuisine
- [ ] Icônes : Lucide React avec `size={20}`
- [ ] Mode compact : `width < 160px` → icônes seules
- [ ] Page : `overflow-y: auto` indépendant de sidebar
