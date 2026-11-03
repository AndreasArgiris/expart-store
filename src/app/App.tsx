import { useState, type ComponentType } from 'react'
import { AnimatePresence, motion, type Variants } from 'motion/react'
import { CartDrawer } from '../features/cart/CartDrawer'
import { CartProvider } from '../features/cart/CartProvider'
import { CartButton } from '../features/cart/CartButton'
import { FrameMarks } from './FrameMarks'
import { Header } from './Header'
import { scrollingPages, useRoute, type Page, type Route } from '../shared/hooks/usePage'
import { AboutPage } from '../features/about/AboutPage'
import { EventsPage } from '../features/events/EventsPage'
import { HomePage } from '../features/home/HomePage'
import { ProductPage } from '../features/shop/ProductPage'
import { ShopPage } from '../features/shop/ShopPage'
import { VinylPage } from '../features/vinyl/VinylPage'

const pages: Record<Exclude<Page, 'product'>, ComponentType> = {
  home: HomePage,
  vinyl: VinylPage,
  events: EventsPage,
  about: AboutPage,
  shop: ShopPage,
}

// Menu order decides slide direction: moving "forward" brings content in from the right.
const ORDER: Page[] = ['home', 'events', 'shop', 'product', 'vinyl', 'about']
const SLIDE = 35 // vw
const ease = [0.16, 1, 0.3, 1] as const

// Opacity runs gentler than the slide so the content stays visible while it travels.
const slide: Variants = {
  enter: (dir: number) => ({ x: `${dir * SLIDE}vw`, opacity: 0 }),
  center: {
    x: '0vw',
    opacity: 1,
    transition: { x: { duration: 0.55, ease }, opacity: { duration: 0.35, ease: 'linear' } },
  },
  exit: (dir: number) => ({
    x: `${dir * -SLIDE}vw`,
    opacity: 0,
    transition: { x: { duration: 0.28, ease: [0.4, 0, 0.9, 0.5] }, opacity: { duration: 0.28, ease: 'easeIn' } },
  }),
}

// Each product is its own page, so moving between products slides too.
const routeKey = (r: Route) => (r.page === 'product' ? `product/${r.slug}` : r.page)

function renderPage(route: Route) {
  if (route.page === 'product') return <ProductPage slug={route.slug} color={route.color} />
  const PageComponent = pages[route.page]
  return <PageComponent />
}

function App() {
  const route = useRoute()
  const { page } = route
  const key = routeKey(route)

  // Derive slide direction from the previous page (state-during-render pattern, no effect needed).
  const [nav, setNav] = useState({ key, page, dir: 1 })
  if (nav.key !== key) setNav({ key, page, dir: ORDER.indexOf(page) >= ORDER.indexOf(nav.page) ? 1 : -1 })

  // The page whose layout is on screen. It only switches once the old page has slid out, so locking
  // to one viewport (Vinyl, Events) can't snap the scroll position mid-slide.
  const [layoutPage, setLayoutPage] = useState(page)

  return (
    <CartProvider>
      <div className={`page${scrollingPages.has(layoutPage) ? ' page--scroll' : ''}`}>
        <FrameMarks />
        <Header page={page} />

        <AnimatePresence
          mode="wait"
          custom={nav.dir}
          initial={false}
          onExitComplete={() => {
            window.scrollTo(0, 0)
            setLayoutPage(page)
          }}
        >
          <motion.div
            key={key}
            className="page-body"
            custom={nav.dir}
            variants={slide}
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
