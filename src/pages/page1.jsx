import TokenTile from '../elements/TokenTile'

export default function Page1() {
  return (
    <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h1 style={{ color: '#e5e7eb', marginBottom: 16 }}>Marmiton Communautaire</h1>
      <p style={{ color: '#94a3b8', fontSize: 14 }}>
        Glissez jusqu'à 4 Inggrédients vers "Ma cuisine" à cuisiner !! 👨🏼‍🍳
      </p>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <TokenTile symbol="BTC" source="hyperliquid" draggable />
        <TokenTile symbol="ETH" source="hyperliquid" draggable />
        <TokenTile symbol="SOL" source="hyperliquid" draggable />
        <TokenTile symbol="BNB" source="hyperliquid" draggable />
        <TokenTile symbol="MATIC" source="hyperliquid" draggable />
        <TokenTile symbol="kPEPE" source="hyperliquid" draggable />
        <TokenTile symbol="AVAX" source="hyperliquid" draggable />
        <TokenTile symbol="ATOM" source="hyperliquid" draggable />
        <TokenTile symbol="APT" source="hyperliquid" draggable />
        <TokenTile symbol="ARB" source="hyperliquid" draggable />
      </div>
    </div>
  )
}
