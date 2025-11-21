import TokenTile from '../elements/TokenTile'

export default function Page1() {
  return (
    <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h1 style={{ color: '#e5e7eb', marginBottom: 16 }}>Marmiton Communautaire</h1>
      <p style={{ color: '#94a3b8', fontSize: 14 }}>
        Glissez jusqu'à 4 tokens vers "Ma cuisine" pour les suivre
      </p>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <TokenTile symbol="BTC" draggable />
        <TokenTile symbol="ETH" draggable />
        <TokenTile symbol="SOL" draggable />
        <TokenTile symbol="BNB" draggable />
        <TokenTile symbol="MATIC" draggable />
        <TokenTile symbol="kPEPE" draggable />
        <TokenTile symbol="AVAX" draggable />
        <TokenTile symbol="ATOM" draggable />
        <TokenTile symbol="APT" draggable />
        <TokenTile symbol="ARB" draggable />
      </div>
    </div>
  )
}
