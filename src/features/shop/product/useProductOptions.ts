import { useState } from 'react'
import { useCart } from '../../cart/cartContext'
import type { MerchColor, MerchProduct } from '../merch'

/**
 * The shopper's colour and size picks for a product, and adding it to the cart. Starts on `initialColor`
 * when it's one of the product's colours, else the first. Sized products can't be added until a size is picked.
 */
export function useProductOptions(product: MerchProduct, initialColor?: string) {
  const { add } = useCart()
  const [colorId, setColorId] = useState<MerchColor['id']>(
    product.colors.find((c) => c.id === initialColor)?.id ?? product.colors[0].id,
  )
  const [size, setSize] = useState<string | null>(null)

  const color = product.colors.find((c) => c.id === colorId) ?? product.colors[0]
  const needsSize = !!product.sizes && !size

  const addToCart = () => add({ slug: product.slug, color: color.id, size: size ?? undefined })

  return { color, setColorId, size, setSize, needsSize, addToCart }
}
