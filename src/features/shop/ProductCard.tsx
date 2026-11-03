import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { formatPrice, type MerchProduct } from './merch'
import { productHref } from '../../shared/hooks/useRoute'
import { ColorSwatches } from './ColorSwatches'
import { EASE_OUT } from '../../shared/motion'

// Cards rise in as they scroll into view; a fifth of a card showing is enough on the tall grid.
const CARD_REVEAL = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
}
const CARD_REVEAL_DURATION = 0.8
const SWAP_FADE = { duration: 0.4 }
const TAGLINE_UNFOLD = { duration: 0.35, ease: EASE_OUT }

/**
 * Shop grid card: model shot (or product shot) that swaps to the flat product shot on hover,
 * colour swatches, and a "+" that unfolds the tagline.
 */
export function ProductCard({ product, delay = 0 }: { product: MerchProduct; delay?: number }) {
  const [colorId, setColorId] = useState(product.colors[0].id)
  const [isOpen, setIsOpen] = useState(false)
  const color = product.colors.find((c) => c.id === colorId) ?? product.colors[0]
  const href = productHref(product.slug, product.colors.length > 1 ? color.id : undefined)

  return (
    <motion.article
      className="product-card"
      {...CARD_REVEAL}
      transition={{ duration: CARD_REVEAL_DURATION, delay, ease: EASE_OUT }}
    >
      <a
        href={href}
        className={`product-media${color.model ? ' has-model' : ''}`}
        aria-label={`${product.name}, ${color.name}`}
      >
        <AnimatePresence initial={false}>
          <motion.div
            key={color.id}
            className="product-media-layer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={SWAP_FADE}
          >
            {color.model && (
              <img className="product-img product-img--model" src={color.model} alt="" draggable={false} />
            )}
            <img className="product-img product-img--flat" src={color.image} alt="" draggable={false} />
          </motion.div>
        </AnimatePresence>
        <span className="product-cta">Shop now ↳</span>
      </a>

      <div className="product-meta">
        <button
          type="button"
          className="product-toggle"
          onClick={() => setIsOpen((o) => !o)}
          aria-expanded={isOpen}
          aria-label={isOpen ? 'Hide details' : 'Show details'}
        >
          {isOpen ? '−' : '+'}
        </button>
        <div className="min-w-0 flex-grow-1">
          <a href={href} className="product-name">
            {product.name}
          </a>
          <div>{formatPrice(product.price)}</div>
          {product.colors.length > 1 && (
            <ColorSwatches colors={product.colors} value={color.id} onChange={setColorId} size="sm" />
          )}
          <AnimatePresence initial={false}>
            {isOpen && (
              <motion.p
                className="product-tagline"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={TAGLINE_UNFOLD}
              >
                {product.tagline}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.article>
  )
}
