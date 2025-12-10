/**
 * Épicerie fine 🛒 - catalogue d'ingrédients financiers
 * Regroupe Hyperliquid et Binance en sections culinaires
 */

import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useSelectedTokens } from '../context/SelectedTokensContext'
import IngredientCard from '../components/IngredientCard'
import {
  INGREDIENTS,
  getIngredientStats,
} from '../config/ingredientsMatrix'

const TIER_TABS = [
  { id: 'free', label: 'Gratuits' },
  { id: 'premium', label: 'Premium' },
]

const selectionKeyFor = (ingredient) => `${ingredient.tokenSymbol}:${ingredient.provider}`

export default function Page1() {
  const { addToken, removeToken, selectedTokens, isFull, count, maxTokens } = useSelectedTokens()
  const selectionSet = new Set(selectedTokens)
  const heroRef = useRef(null)
  const freeSectionRef = useRef(null)
  const premiumSectionRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()
  const currentTab = location.hash === '#premium' ? 'premium' : 'free'

  useEffect(() => {
    if (typeof window === 'undefined') return

    const updateHeights = () => {
      const topbar = document.querySelector('.topbar')
      const measured = topbar?.offsetHeight ?? 0
      const rootStyle = document.documentElement?.style
      if (!rootStyle) return
      rootStyle.setProperty('--cookie-topbar-height', `${measured}px`)
    }

    updateHeights()
    window.addEventListener('resize', updateHeights)
    return () => window.removeEventListener('resize', updateHeights)
  }, [])

  const globalStats = useMemo(() => getIngredientStats(), [])
  const {
    freeIngredients,
    premiumIngredients,
  } = useMemo(() => {
    const hyperFree = INGREDIENTS
      .filter((ingredient) => ingredient.provider === 'hyperliquid' && ingredient.frequency === 'omnipresent')
      .slice(0, 4)

    const binanceFree = INGREDIENTS
      .filter((ingredient) => ingredient.provider === 'binance' && ingredient.frequency === 'tres_frequent')
      .slice(0, 5)

    const freeKeys = new Set([
      ...hyperFree.map(selectionKeyFor),
      ...binanceFree.map(selectionKeyFor),
    ])

    const premiumHyper = INGREDIENTS
      .filter((ingredient) => ingredient.provider === 'hyperliquid' && !freeKeys.has(selectionKeyFor(ingredient)))

    const premiumBin = INGREDIENTS
      .filter((ingredient) => ingredient.provider === 'binance' && !freeKeys.has(selectionKeyFor(ingredient)))

    return {
      freeIngredients: [...hyperFree, ...binanceFree],
      premiumIngredients: [...premiumHyper, ...premiumBin],
    }
  }, [])

  const handleAdd = (selectionKey) => {
    return addToken(selectionKey)
  }

  const handleRemove = (selectionKey) => {
    return removeToken(selectionKey)
  }

  const getStickyOffset = useCallback(() => {
    if (typeof window === 'undefined') return 108
    const computed = window.getComputedStyle(document.documentElement)
    const topbarValue = computed.getPropertyValue('--cookie-topbar-height')
    const parsed = parseFloat(topbarValue)
    const topbarHeight = Number.isNaN(parsed) ? 96 : parsed
    return topbarHeight + 16
  }, [])

  const getScrollContainer = useCallback(() => {
    if (typeof window === 'undefined') return null
    return heroRef.current?.closest('.page') ?? document.querySelector('.page') ?? null
  }, [])

  const smoothScroll = useCallback((targetTop) => {
    if (typeof window === 'undefined') return
    const container = getScrollContainer()
    const clampedTop = Math.max(targetTop, 0)

    if (!container) {
      window.scrollTo({ top: clampedTop, behavior: 'smooth' })
      return
    }

    if (container === window || container === document.body || container === document.documentElement) {
      window.scrollTo({ top: clampedTop, behavior: 'smooth' })
      return
    }

    container.scrollTo({ top: clampedTop, behavior: 'smooth' })
  }, [getScrollContainer])

  const scrollToSection = useCallback((sectionRef) => {
    if (!sectionRef?.current) return
    const stickyOffset = getStickyOffset()
    const extraGap = 8
    const targetPosition = sectionRef.current.offsetTop - (stickyOffset + extraGap)
    smoothScroll(targetPosition)
  }, [getStickyOffset, smoothScroll])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (location.hash === '#premium') {
      requestAnimationFrame(() => scrollToSection(premiumSectionRef))
      return
    }
    if (location.hash === '#gratuits') {
      requestAnimationFrame(() => scrollToSection(freeSectionRef))
      return
    }
    requestAnimationFrame(() => smoothScroll(0))
  }, [location.hash, scrollToSection, smoothScroll])

  const handleTabClick = (tabId) => {
    const hashValue = tabId === 'premium' ? 'premium' : tabId === 'free' ? 'gratuits' : undefined
    navigate({ pathname: location.pathname, search: location.search, hash: hashValue }, { replace: false })

    if (tabId === 'premium') {
      scrollToSection(premiumSectionRef)
      return
    }
    if (tabId === 'free') {
      scrollToSection(freeSectionRef)
      return
    }
    smoothScroll(0)
  }

  return (
    <div className="ingredients-page">
      <section ref={heroRef} className="ingredients-header" aria-label="En-tête Épicerie fine">
        <div className="ingredients-header__row">
          <div className="ingredients-header__title">
            <h1>L’Épicerie Fine</h1>
            <p>Catalogue Hyperliquid & Binance pour composer ta sélection.</p>
          </div>
          <div className="section-metrics section-metrics--compact" aria-label="Statistiques des ingrédients">
            <span className="metric-pill"><strong>{count}</strong> / {maxTokens} utilisés</span>
            <span className="metric-pill"><strong>{globalStats.free}</strong> gratuits</span>
            <span className="metric-pill"><strong>{globalStats.premium}</strong> premium</span>
            <span className="metric-pill"><strong>{globalStats.total}</strong> total</span>
          </div>
        </div>

        <div className="ingredients-header__filters">
          <div className="ingredient-tabs ingredient-tabs--flat" role="tablist" aria-label="Filtres d’ingrédients">
            {TIER_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={tab.id === currentTab}
                className={tab.id === currentTab ? 'is-active' : ''}
                onClick={() => handleTabClick(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="section-block section-block--flat ingredients-section" ref={freeSectionRef}>
        <div className="ingredients-provider__head ingredients-provider__head--section">
          <div>
            <div className="ingredients-provider__title">Gratuits</div>
            <p className="ingredient-card__provider-note">Sélection offerte par Hyperliquid et Binance.</p>
          </div>
          <span className="ingredient-pill ingredient-pill--muted">{freeIngredients.length} ingrédients</span>
        </div>

        <div className="frequency-group frequency-group--single">
          <div className="frequency-group__list">
            {freeIngredients.map((ingredient) => {
              const selectionKey = selectionKeyFor(ingredient)
              const isSelected = selectionSet.has(selectionKey)
              return (
                <IngredientCard
                  key={selectionKey}
                  ingredient={ingredient}
                  isSelected={isSelected}
                  disableAdd={isFull && !isSelected}
                  onAdd={() => handleAdd(selectionKey)}
                  onRemove={() => handleRemove(selectionKey)}
                />
              )
            })}
          </div>
        </div>
      </section>

      <section className="section-block section-block--flat ingredients-section" ref={premiumSectionRef}>
        <div className="ingredients-provider__head ingredients-provider__head--section">
          <div>
            <div className="ingredients-provider__title">Premium</div>
            <p className="ingredient-card__provider-note">Les ingrédients avancés pour pimenter tes recettes.</p>
          </div>
          <span className="ingredient-pill ingredient-pill--muted">{premiumIngredients.length} ingrédients</span>
        </div>

        <div className="frequency-group frequency-group--single">
          <div className="frequency-group__list">
            {premiumIngredients.map((ingredient) => {
              const selectionKey = selectionKeyFor(ingredient)
              const isSelected = selectionSet.has(selectionKey)
              return (
                <IngredientCard
                  key={selectionKey}
                  ingredient={ingredient}
                  isSelected={isSelected}
                  disableAdd={isFull && !isSelected}
                  onAdd={() => handleAdd(selectionKey)}
                  onRemove={() => handleRemove(selectionKey)}
                />
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
