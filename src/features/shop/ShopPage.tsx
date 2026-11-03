import { motion } from 'motion/react'
import { ContactSection } from '../contact/ContactSection'
import { Parallax } from '../../shared/components/Parallax'
import { ProductCard } from './ProductCard'
import { merch } from './merch'
import { EASE_OUT } from '../../shared/motion'


export function ShopPage() {
  return (
    <main className="shop">
      <motion.div
        className="shop-head"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.1, ease: EASE_OUT }}
      >
        <Parallax distance={20}>
          <div className="d-flex justify-content-between align-items-center">
            <div className="sq-label">Expart shop</div>
            <div className="text-secondary">{merch.length} products</div>
          </div>
        </Parallax>
      </motion.div>

      <div className="product-grid">
        {merch.map((p, i) => (
          <ProductCard key={p.slug} product={p} delay={0.15 + i * 0.07} />
        ))}
      </div>

      <ContactSection />
    </main>
  )
}
