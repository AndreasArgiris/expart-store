import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CartProvider } from '../features/cart/CartProvider'
import { Header } from './Header'

const renderHeader = () =>
  render(
    <CartProvider>
      <Header page="home" />
    </CartProvider>,
  )

const toggle = () => screen.getByRole('button', { name: /menu$/i })
const openMenu = () => document.querySelector<HTMLElement>('.mobile-menu')

describe('Header on mobile', () => {
  const desktopMatchMedia = window.matchMedia

  beforeEach(() => {
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: query.includes('width <'),
      addEventListener: () => {},
      removeEventListener: () => {},
    }))
  })

  afterEach(() => {
    vi.stubGlobal('matchMedia', desktopMatchMedia)
  })

  it('opens and closes the menu from the burger', async () => {
    const user = userEvent.setup()
    renderHeader()
    expect(toggle()).toHaveAccessibleName('Open menu')
    expect(toggle()).toHaveAttribute('aria-expanded', 'false')

    await user.click(toggle())
    expect(toggle()).toHaveAccessibleName('Close menu')
    expect(toggle()).toHaveAttribute('aria-expanded', 'true')
    expect(openMenu()).toBeInTheDocument()

    await user.click(toggle())
    expect(toggle()).toHaveAttribute('aria-expanded', 'false')
  })

  it('closes on Escape and locks page scroll only while open', async () => {
    const user = userEvent.setup()
    renderHeader()

    await user.click(toggle())
    expect(document.body.style.overflow).toBe('hidden')

    await user.keyboard('{Escape}')
    expect(toggle()).toHaveAttribute('aria-expanded', 'false')
    expect(document.body.style.overflow).toBe('')
  })

  it('closes when a menu link is followed', async () => {
    const user = userEvent.setup()
    renderHeader()

    await user.click(toggle())
    const menu = openMenu()
    if (!menu) throw new Error('menu did not open')
    await user.click(within(menu).getByRole('link', { name: 'About' }))

    expect(toggle()).toHaveAttribute('aria-expanded', 'false')
  })
})
