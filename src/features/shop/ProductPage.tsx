import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useCart } from '../cart/cartContext'
import { Parallax } from '../../shared/components/Parallax'
import { ColorSwatches } from './ColorSwatches'
import { ProductCard } from './ProductCard'
import { findProduct, formatPrice, merch, type MerchColor, type MerchProduct } from './merch'
import { pageHref } from '../../shared/hooks/usePage'
import { EASE_OUT, rise } from '../../shared/motion'

type View = 'model' | 'product'

function Gallery({ product, color }: { product: MerchProduct; color: MerchColor }) {
  const [view, setView] = useState<View>('model')
  const shown: View = view === 'model' && color.model ? 'model' : 'product'
  const src = shown === 'model' ? color.model! : color.image

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
          {(['model', 'product'] as const).map((v) => (
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

function ProductView({ product, initialColor }: { product: MerchProduct; initialColor?: string }) {
  const { add } = useCart()
  const [colorId, setColorId] = useState<MerchColor['id']>(
    product.colors.find((c) => c.id === initialColor)?.id ?? product.colors[0].id,
  )
  const [size, setSize] = useState<string | null>(null)
  const color = product.colors.find((c) => c.id === colorId) ?? product.colors[0]
  const needsSize = !!product.sizes && !size
  const related = merch.filter((p) => p.slug !== product.slug)
  const model = color.modelInfo
  const hasDetails = product.details.length > 0 || !!model

  return (
    <main className="pdp">
      <section className="row g-0 pdp-main">
        {hasDetails && (
          <motion.div className="col-12 col-lg-3 order-3 order-lg-1 pdp-details" {...rise(0.25)}>
            <Parallax distance={30}>
              {product.details.map((d) => (
                <div key={d.label} className="pdp-detail">
                  <div className="sq-label pdp-detail-label">{d.label}</div>
                  <p className="mb-0">{d.text}</p>
                </div>
              ))}
              {model && (
                <div className="pdp-detail">
                  <div className="sq-label pdp-detail-label">Model</div>
                  <dl className="pdp-model">
                    <div>
                      <dt>Height:</dt>
                      <dd>{model.height}</dd>
                    </div>
                    <div>
                      <dt>Weight:</dt>
                      <dd>{model.weight}</dd>
                    </div>
                    <div>
                      <dt>Wearing size:</dt>
                      <dd>{model.size}</dd>
                    </div>
                  </dl>
                </div>
              )}
            </Parallax>
          </motion.div>
        )}

        <motion.div
          className={`col-12 order-1 order-lg-2 ${hasDetails ? 'col-lg-5' : 'col-lg-6 offset-lg-1'}`}
          {...rise(0.1)}
        >
          <Gallery product={product} color={color} />
        </motion.div>

        <motion.div className="col-12 col-lg-4 order-2 order-lg-3 pdp-buy" {...rise(0.2)}>
          <Parallax distance={30}>
            <h1 className="pdp-name">{product.name}</h1>
            <div className="pdp-price">{formatPrice(product.price)}</div>
            <p className="pdp-tagline">{product.tagline}</p>

            {product.colors.length > 1 && (
              <div className="pdp-option">
                <div className="pdp-option-label">Color: {color.name}</div>
                <ColorSwatches colors={product.colors} value={color.id} onChange={setColorId} />
              </div>
            )}

            {product.sizes && (
              <div className="pdp-option">
                <div className="pdp-option-label">Size{size ? `: ${size}` : ''}</div>
                <div className="sizes" role="radiogroup" aria-label="Size">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      type="button"
                      role="radio"
                      aria-checked={s === size}
                      className={`size-opt${s === size ? ' is-active' : ''}`}
                      onClick={() => setSize(s)}
                    >
                      {s === size && (
                        <>
                          <span className="fc fc-tl" />
                          <span className="fc fc-tr" />
                          <span className="fc fc-bl" />
                          <span className="fc fc-br" />
                        </>
                      )}
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              type="button"
              className="btn-accent"
              disabled={needsSize}
              onClick={() => add({ slug: product.slug, color: color.id, size: size ?? undefined })}
            >
              {needsSize ? 'Select a size' : 'Add to cart +'}
            </button>
          </Parallax>
        </motion.div>
      </section>

      <section className="pdp-related" aria-labelledby="related-title">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div id="related-title" className="sq-label">
            You might also like
          </div>
          <a href={pageHref.shop} className="text-link">
            Explore all ↳
          </a>
        </div>
        <div className="product-grid product-grid--related">
          {related.map((p, i) => (
            <ProductCard key={p.slug} product={p} delay={i * 0.07} />
          ))}
        </div>
      </section>
    </main>
  )
}

export function ProductPage({ slug, color }: { slug?: string; color?: string }) {
  const product = findProduct(slug)

  if (!product) {
    return (
      <main className="pdp pdp--missing">
        <div className="sq-label mb-4">Not found</div>
        <p>We couldn't find that product.</p>
        <a href={pageHref.shop} className="text-link">
          Back to the shop ↳
        </a>
      </main>
    )
  }

  return <ProductView product={product} initialColor={color} />
}
