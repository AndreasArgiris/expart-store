import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { formatPrice, type MerchProduct } from '../../data/merch'
import { productHref } from '../../hooks/usePage'
import { ColorSwatches } from './ColorSwatches'

const ease = [0.22, 1, 0.36, 1] as const

/**
 * Shop grid card: model shot (or product shot) that swaps to the flat product shot on hover,
 * colour swatches, and a "+" that unfolds the tagline.
 */
export function ProductCard({ product, delay = 0 }: { product: MerchProduct; delay?: number }) {
  const [colorId, setColorId] = useState(product.colors[0].id)
  const [open, setOpen] = useState(false)
  const color = product.colors.find((c) => c.id === colorId) ?? product.colors[0]
  const href = productHref(product.slug, product.colors.length > 1 ? color.id : undefined)

  return (
    <motion.article
      className="product-card"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8, delay, ease }}
    >
      <a href={href} className={`product-media${color.model ? ' has-model' : ''}`} aria-label={`${product.name}, ${color.name}`}>
        <AnimatePresence initial={false}>
          <motion.div
            key={color.id}
            className="product-media-layer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            {color.model && <img className="product-img product-img--model" src={color.model} alt="" draggable={false} />}
            <img className="product-img product-img--flat" src={color.image} alt="" draggable={false} />
          </motion.div>
        </AnimatePresence>
        <span className="product-cta">Shop now ↳</span>
      </a>

      <div className="product-meta">
        <button
          type="button"
          className="product-toggle"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-label={open ? 'Hide details' : 'Show details'}
        >
          {open ? '−' : '+'}
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
            {open && (
              <motion.p
                className="product-tagline"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.35, ease }}
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
