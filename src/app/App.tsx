import type { ComponentType } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { CartDrawer } from '../features/cart/CartDrawer'
import { CartProvider } from '../features/cart/CartProvider'
import { CartButton } from '../features/cart/CartButton'
import { FrameMarks } from './FrameMarks'
import { Header } from './Header'
import { pageSlide, usePageTransition } from './usePageTransition'
import { scrollingPages, useRoute, type Page, type Route } from '../shared/hooks/useRoute'
import { AboutPage } from '../features/about/AboutPage'
import { EventsPage } from '../features/events/EventsPage'
import { HomePage } from '../features/home/HomePage'
import { ProductPage } from '../features/shop/product/ProductPage'
import { ShopPage } from '../features/shop/ShopPage'
import { VinylPage } from '../features/vinyl/VinylPage'

const pages: Record<Exclude<Page, 'product'>, ComponentType> = {
  home: HomePage,
  vinyl: VinylPage,
  events: EventsPage,
  about: AboutPage,
  shop: ShopPage,
}

function renderPage(route: Route) {
  if (route.page === 'product') return <ProductPage slug={route.slug} color={route.color} />
  const PageComponent = pages[route.page]
  return <PageComponent />
}

/** The site shell: frame marks, header, the sliding page area, and the cart (button on shop pages, drawer). */
function App() {
  const route = useRoute()
  const { page } = route
  const { key, direction, layoutPage, handleExitComplete } = usePageTransition(route)

  return (
    <CartProvider>
      <div className={`page${scrollingPages.has(layoutPage) ? ' page--scroll' : ''}`}>
        <FrameMarks />
        <Header page={page} />

        <AnimatePresence mode="wait" custom={direction} initial={false} onExitComplete={handleExitComplete}>
          <motion.div
            key={key}
            className="page-body"
            custom={direction}
            variants={pageSlide}
            initial="enter"
            animate="center"
            exit="exit"
          >
            {renderPage(route)}
          </motion.div>
        </AnimatePresence>

        {(page === 'shop' || page === 'product') && <CartButton />}
      </div>
      <CartDrawer />
    </CartProvider>
  )
}

export default App
