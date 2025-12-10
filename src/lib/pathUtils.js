export function normalizePath(path = '') {
  const decoded = decodeURIComponent(path)
  // Supprime les slashs finaux sauf s'il s'agit uniquement de la racine
  const trimmed = decoded.endsWith('/') && decoded !== '/' ? decoded.replace(/\/+$/, '') : decoded
  return trimmed || '/'
}

export function isActivePath(currentPath, targetPath) {
  return normalizePath(currentPath) === normalizePath(targetPath)
}
