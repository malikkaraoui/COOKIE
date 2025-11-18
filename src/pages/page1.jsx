import useBtc24h from '../hooks/useBtc24h';
import BtcTile from '../components/BtcTile';

export default function Page1(){
  const { price, deltaAbs, deltaPct, status, error } = useBtc24h();
  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ marginBottom: 12 }}>BTC — Live</h2>
      <BtcTile price={price} deltaAbs={deltaAbs} deltaPct={deltaPct} status={status} error={error} />
    </div>
  );
}
