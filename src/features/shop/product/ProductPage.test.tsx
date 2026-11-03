import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { useCart } from '../../cart/cartContext'
import { CartProvider } from '../../cart/CartProvider'
import { ProductPage } from './ProductPage'

/** Shows what's in the cart, the way the header's cart link does. */
function CartCount() {
  const { count, entries } = useCart()
  return (
    <output aria-label="cart">
      {count} {entries.map((e) => `${e.product.slug}/${e.color}/${e.size ?? '-'}`).join(',')}
    </output>
  )
}

const renderProduct = (slug: string, color?: string) =>
  render(
    <CartProvider>
      <ProductPage slug={slug} color={color} />
      <CartCount />
    </CartProvider>,
  )

describe('ProductPage', () => {
  it('asks for a size before a sized product can be added', async () => {
    const user = userEvent.setup()
    renderProduct('cotton-tee')

    const addButton = screen.getByRole('button', { name: 'Select a size' })
    expect(addButton).toBeDisabled()

    await user.click(screen.getByRole('radio', { name: 'M' }))
    await user.click(screen.getByRole('button', { name: 'Add to cart +' }))

    expect(screen.getByLabelText('cart')).toHaveTextContent('1 cotton-tee/black/M')
  })

  it('starts on the colour from the link and adds that colour', async () => {
    const user = userEvent.setup()
    renderProduct('leather-vinyl-bag', 'white')

    expect(screen.getByText('Color: White')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Add to cart +' }))

    expect(screen.getByLabelText('cart')).toHaveTextContent('1 leather-vinyl-bag/white/-')
  })

  it('shows a way back to the shop for an unknown product', () => {
    renderProduct('no-such-thing')
    expect(screen.getByText("We couldn't find that product.")).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /back to the shop/i })).toHaveAttribute('href', '#/shop')
  })
})
