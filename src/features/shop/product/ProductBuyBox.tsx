import { ColorSwatches } from '../ColorSwatches'
import { formatPrice, type MerchProduct } from '../merch'
import { SizePicker } from './SizePicker'
import type { useProductOptions } from './useProductOptions'

interface ProductBuyBoxProps {
  product: MerchProduct
  options: ReturnType<typeof useProductOptions>
}

/** Name, price and pitch, the colour and size pickers, and the add-to-cart button. */
export function ProductBuyBox({ product, options }: ProductBuyBoxProps) {
  const { color, setColorId, size, setSize, needsSize, addToCart } = options

  return (
    <>
      <h1 className="pdp-name">{product.name}</h1>
      <div className="pdp-price">{formatPrice(product.price)}</div>
      <p className="pdp-tagline">{product.tagline}</p>

      {product.colors.length > 1 && (
        <div className="pdp-option">
          <div className="pdp-option-label">Color: {color.name}</div>
          <ColorSwatches colors={product.colors} value={color.id} onChange={setColorId} />
        </div>
      )}

      {product.sizes && <SizePicker sizes={product.sizes} value={size} onChange={setSize} />}

      <button type="button" className="btn-accent" disabled={needsSize} onClick={addToCart}>
        {needsSize ? 'Select a size' : 'Add to cart +'}
      </button>
    </>
  )
}
