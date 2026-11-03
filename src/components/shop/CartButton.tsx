import { motion } from 'framer-motion'
import { useCart } from '../../cart/cartContext'

/** Floating "Cart (n items)" tab, bottom right, on shop pages. */
export function CartButton() {
  const { count, open } = useCart()

  return (
    <motion.button
      type="button"
      className="cart-fab sq-label"
      onClick={open}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      Cart <span className="cart-tab-count">({count} items)</span>
    </motion.button>
  )
}
