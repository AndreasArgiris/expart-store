import { motion } from 'motion/react'
import { ContactSection } from '../contact/ContactSection'
import { Parallax } from '../../shared/components/Parallax'
import { ProductCard } from './ProductCard'
import { merch } from './merch'
import { rise } from '../../shared/motion'

const HEAD_DRIFT = 20 // px parallax
const HEAD_DELAY = 0.1 // s
const FIRST_CARD_DELAY = 0.15 // s, just after the header
const CARD_STAGGER = 0.07 // s between cards

/** The merch grid, with a product count, followed by the contact section. */
export function ShopPage() {
  return (
    <main className="shop">
      <motion.div className="shop-head" {...rise(HEAD_DELAY)}>
        <Parallax distance={HEAD_DRIFT}>
          <div className="d-flex justify-content-between align-items-center">
            <div className="sq-label">Expart shop</div>
            <div className="text-secondary">{merch.length} products</div>
          </div>
        </Parallax>
      </motion.div>

      <div className="product-grid">
        {merch.map((p, i) => (
          <ProductCard key={p.slug} product={p} delay={FIRST_CARD_DELAY + i * CARD_STAGGER} />
        ))}
      </div>

      <ContactSection />
    </main>
  )
}
