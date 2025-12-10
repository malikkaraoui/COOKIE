import { INGREDIENT_FREQUENCIES } from '../config/ingredientsMatrix'

const toneClassMap = {
  success: 'ingredient-pill--success',
  info: 'ingredient-pill--info',
  muted: 'ingredient-pill--muted',
  warning: 'ingredient-pill--warning',
}

export default function IngredientCard({
  ingredient,
  isSelected,
  disableAdd,
  onAdd,
  onRemove,
}) {
  const {
    label,
    tokenSymbol,
    category,
    description,
    note,
    emoji,
    frequency,
    tier,
  } = ingredient

  const frequencyMeta = INGREDIENT_FREQUENCIES.find((freq) => freq.id === frequency)
  const badgeClass = frequencyMeta ? toneClassMap[frequencyMeta.tone] : toneClassMap.muted

  const handleAction = () => {
    if (isSelected) {
      onRemove?.()
      return
    }
    if (!disableAdd) {
      onAdd?.()
    }
  }

  return (
    <article className={[
      'ingredient-card',
      isSelected && 'ingredient-card--selected',
      tier === 'premium' && 'ingredient-card--premium',
    ].filter(Boolean).join(' ')}>
      <header className="ingredient-card__head">
        <div className="ingredient-card__title">
          <span className="ingredient-card__emoji" aria-hidden="true">{emoji}</span>
          <div>
            <p className="ingredient-card__label">{label}</p>
            <p className="ingredient-card__code">{tokenSymbol}</p>
          </div>
        </div>
        {frequencyMeta && (
          <span className={['ingredient-pill', badgeClass].join(' ')}>{frequencyMeta.label}</span>
        )}
      </header>

      <div className="ingredient-card__meta">
        <span className="ingredient-card__category">{category}</span>
      </div>

      <p className="ingredient-card__description">{description}</p>
      {note && note.trim() !== description?.trim() && (
        <p className="ingredient-card__note">{note}</p>
      )}

      <footer className="ingredient-card__footer">
        <span className={[
          'ingredient-pill',
          tier === 'premium' ? 'ingredient-pill--premium' : 'ingredient-pill--free',
        ].join(' ')}>
          {tier === 'premium' ? 'Premium' : 'Gratuit'}
        </span>
        <button
          type="button"
          className={[
            'ingredient-card__action',
            isSelected ? 'ingredient-card__action--remove' : 'ingredient-card__action--add',
          ].join(' ')}
          onClick={handleAction}
          disabled={!isSelected && disableAdd}
        >
          {isSelected ? 'Retirer' : 'Ajouter'}
        </button>
      </footer>
    </article>
  )
}
