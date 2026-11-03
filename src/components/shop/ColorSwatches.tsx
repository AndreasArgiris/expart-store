import type { MerchColor } from '../../data/merch'

interface Props {
  colors: MerchColor[]
  value: MerchColor['id']
  onChange: (id: MerchColor['id']) => void
  /** "sm": bare squares for cards; "md": squares with names for the product page. */
  size?: 'sm' | 'md'
}

export function ColorSwatches({ colors, value, onChange, size = 'md' }: Props) {
  return (
    <div className={`swatches swatches--${size}`} role="radiogroup" aria-label="Color">
      {colors.map((c) => (
        <button
          key={c.id}
          type="button"
          role="radio"
          aria-checked={c.id === value}
          aria-label={c.name}
          className={`swatch${c.id === value ? ' is-active' : ''}`}
          onClick={() => onChange(c.id)}
        >
          <span className="swatch-chip" style={{ background: c.swatch }} />
          {size === 'md' && <span>{c.name}</span>}
        </button>
      ))}
    </div>
  )
}
