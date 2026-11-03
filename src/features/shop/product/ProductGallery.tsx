import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { EASE_OUT } from '../../../shared/motion'
import type { MerchColor, MerchProduct } from '../merch'

type View = 'model' | 'product'
const VIEWS: View[] = ['model', 'product']

interface ProductGalleryProps {
  product: MerchProduct
  color: MerchColor
}

/** The product photo, cross-fading between the model shot and the flat product shot when both exist. */
export function ProductGallery({ product, color }: ProductGalleryProps) {
  const [view, setView] = useState<View>('model')
  const shown: View = view === 'model' && color.model ? 'model' : 'product'
  const src = shown === 'model' && color.model ? color.model : color.image

  return (
    <div className="pdp-gallery">
      <div className="pdp-stage">
        <AnimatePresence initial={false}>
          <motion.img
            key={src}
            src={src}
            alt={`${product.name}, ${color.name}${shown === 'model' ? ', worn by a model' : ''}`}
            className="pdp-img"
            draggable={false}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE_OUT }}
          />
        </AnimatePresence>
      </div>
      {color.model && (
        <div className="pdp-thumbs" role="tablist" aria-label="Photos">
          {VIEWS.map((v) => (
            <button
              key={v}
              type="button"
              role="tab"
              aria-selected={shown === v}
              className={`pdp-thumb${shown === v ? ' is-active' : ''}`}
              onClick={() => setView(v)}
            >
              <img src={v === 'model' ? color.model : color.image} alt={v === 'model' ? 'Model photo' : 'Product photo'} />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
