const sanitizeLabel = (label) => {
  if (typeof label !== 'string') return ''
  return label.trim()
}

/**
 * Renvoie les props d'accessibilité/tooltip associées à un label.
 * @param {string} label - Texte lisible par l'utilisateur.
 * @param {object} options
 * @param {boolean} options.withTooltip - Ajoute l'attribut title si true.
 */
export function getHoverLabelProps(label, { withTooltip = true } = {}) {
  const text = sanitizeLabel(label)
  if (!text) {
    return {}
  }

  const props = {
    'aria-label': text,
  }

  if (withTooltip) {
    props.title = text
  }

  return props
}
