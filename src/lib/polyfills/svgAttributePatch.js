const SVG_LENGTH_FALLBACK = '1em'
const PATCH_FLAG = '__cookieSvgWidthPatched__'

function normalizeLengthValue(value) {
  if (value === '' || value === null || value === undefined) {
    return SVG_LENGTH_FALLBACK
  }
  return value
}

function patchSvgAttributeMethods() {
  if (typeof window === 'undefined') return
  if (typeof SVGElement === 'undefined') return

  const proto = SVGElement.prototype
  if (proto[PATCH_FLAG]) {
    return
  }

  const originalSetAttribute = proto.setAttribute
  const originalSetAttributeNS = proto.setAttributeNS

  const shouldNormalize = (element, name, value) => {
    if (!element || typeof element.tagName !== 'string') return false
    const isSvgTag = element.tagName.toLowerCase() === 'svg'
    if (!isSvgTag) return false
    const isLengthAttr = name === 'width' || name === 'height'
    if (!isLengthAttr) return false
    return value === '' || value === null || value === undefined
  }

  proto.setAttribute = function patchedSetAttribute(name, value) {
    const nextValue = shouldNormalize(this, name, value) ? normalizeLengthValue(value) : value
    return originalSetAttribute.call(this, name, nextValue)
  }

  proto.setAttributeNS = function patchedSetAttributeNS(namespace, name, value) {
    const nextValue = shouldNormalize(this, name, value) ? normalizeLengthValue(value) : value
    return originalSetAttributeNS.call(this, namespace, name, nextValue)
  }

  Object.defineProperty(proto, PATCH_FLAG, {
    value: true,
    configurable: false,
    enumerable: false,
    writable: false,
  })
}

patchSvgAttributeMethods()
