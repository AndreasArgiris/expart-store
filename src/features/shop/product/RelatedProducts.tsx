import { pageHref } from '../../../shared/hooks/useRoute'
import { ProductCard } from '../ProductCard'
import { merch } from '../merch'

const CARD_STAGGER = 0.07 // s between each card's entrance

/** "You might also like": every other product in the shop. */
export function RelatedProducts({ excludeSlug }: { excludeSlug: string }) {
  const related = merch.filter((p) => p.slug !== excludeSlug)

  return (
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
          <ProductCard key={p.slug} product={p} delay={i * CARD_STAGGER} />
        ))}
      </div>
    </section>
  )
}
