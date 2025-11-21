import useToken24h from './useToken24h'

// Wrapper spécifique BTC conservant l’ancienne interface pour compatibilité
export default function useBtc24h() {
  return useToken24h('BTC')
}
