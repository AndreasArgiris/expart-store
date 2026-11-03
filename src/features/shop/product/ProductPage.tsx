import { motion } from 'motion/react'
import { Parallax } from '../../../shared/components/Parallax'
import { pageHref } from '../../../shared/hooks/useRoute'
import { rise } from '../../../shared/motion'
import { findProduct, type MerchProduct } from '../merch'
import { ProductBuyBox } from './ProductBuyBox'
import { ProductDetails } from './ProductDetails'
import { ProductGallery } from './ProductGallery'
import { RelatedProducts } from './RelatedProducts'
import { useProductOptions } from './useProductOptions'

interface ProductViewProps {
  product: MerchProduct
  initialColor?: string
}

function ProductView({ product, initialColor }: ProductViewProps) {
  const options = useProductOptions(product, initialColor)
  const model = options.color.modelInfo
  const hasDetails = product.details.length > 0 || !!model

  return (
    <main className="pdp">
      <section className="row g-0 pdp-main">
        {hasDetails && (
          <motion.div className="col-12 col-lg-3 order-3 order-lg-1 pdp-details" {...rise(0.25)}>
            <Parallax>
              <ProductDetails details={product.details} model={model} />
            </Parallax>
          </motion.div>
        )}

        <motion.div
          className={`col-12 order-1 order-lg-2 ${hasDetails ? 'col-lg-5' : 'col-lg-6 offset-lg-1'}`}
          {...rise(0.1)}
        >
          <ProductGallery product={product} color={options.color} />
        </motion.div>

        <motion.div className="col-12 col-lg-4 order-2 order-lg-3 pdp-buy" {...rise(0.2)}>
          <Parallax>
            <ProductBuyBox product={product} options={options} />
          </Parallax>
        </motion.div>
      </section>

      <RelatedProducts excludeSlug={product.slug} />
    </main>
  )
}

function ProductNotFound() {
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

/** A merch product page, from the `#/shop/<slug>/<color>` route. */
export function ProductPage({ slug, color }: { slug?: string; color?: string }) {
  const product = findProduct(slug)
  return product ? <ProductView product={product} initialColor={color} /> : <ProductNotFound />
}
