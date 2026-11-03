// Merch catalogue, from public/media/products/merch/merch-info.txt.
const DIR = '/media/products/merch'

export interface MerchColor {
  id: 'black' | 'white'
  name: string
  swatch: string
  /** Flat product shot (square, white background). */
  image: string
  /** Model wearing / carrying it (2:3), when there is one. */
  model?: string
  /** Measurements of the model in the photo, for apparel. */
  modelInfo?: ModelInfo
}

export interface ModelInfo {
  height: string
  weight: string
  size: string
}

const MODEL_BOY: ModelInfo = { height: '1.88 m', weight: '80 kg', size: 'Large' }
const MODEL_GIRL: ModelInfo = { height: '1.76 m', weight: '56 kg', size: 'Medium' }

export interface MerchProduct {
  slug: string
  name: string
  /** One-line pitch, shown on the shop card and product page. */
  tagline: string
  price: number
  /** Info blocks on the product page, label → text. */
  details: { label: string; text: string }[]
  colors: MerchColor[]
  /** Only apparel has sizes. */
  sizes?: string[]
}

const APPAREL_SIZES = ['XS', 'S', 'M', 'L', 'XL']

const black = (image: string, model?: string): MerchColor => ({
  id: 'black',
  name: 'Black',
  swatch: '#111',
  image: `${DIR}/${image}`,
  model: model && `${DIR}/models/${model}`,
})

const white = (image: string, model?: string): MerchColor => ({
  id: 'white',
  name: 'White',
  swatch: '#fff',
  image: `${DIR}/${image}`,
  model: model && `${DIR}/models/${model}`,
})

export const merch: MerchProduct[] = [
  {
    slug: 'leather-vinyl-bag',
    name: 'Leather Vinyl Bag',
    tagline: 'Carry your vinyls with style.',
    price: 69,
    details: [{ label: 'Material', text: 'Pure leather.' }],
    colors: [black('merch1-black.webp', 'merch1modelblack.webp'), white('merch1-white.webp', 'merch1modelwhite.webp')],
  },
  {
    slug: 'cotton-sweatshirt',
    name: 'Cotton Sweatshirt',
    tagline: 'For cozy cold days.',
    price: 30,
    details: [{ label: 'Material', text: '100% high quality cotton.' }],
    colors: [
      { ...black('merch2-black.webp', 'merch2modelblack.webp'), modelInfo: MODEL_GIRL },
      { ...white('merch2-white.webp', 'merch2model.webp'), modelInfo: MODEL_BOY },
    ],
    sizes: APPAREL_SIZES,
  },
  {
    slug: 'cotton-tee',
    name: 'Lightweight Cotton Tee',
    tagline: 'A comfortable, breathable tee.',
    price: 20,
    details: [{ label: 'Material', text: '100% high quality lightweight cotton.' }],
    colors: [
      { ...black('merch3-black.webp', 'merch3modelblack.webp'), modelInfo: MODEL_GIRL },
      { ...white('merch3-white.webp', 'merch3model.webp'), modelInfo: MODEL_BOY },
    ],
    sizes: APPAREL_SIZES,
  },
  {
    slug: 'sticker-pack',
    name: 'Sticker Pack (x5)',
    tagline: 'Customize your stuff with these waterproof stickers.',
    price: 2,
    details: [],
    colors: [{ id: 'white', name: 'White', swatch: '#fff', image: `${DIR}/merch4.webp` }],
  },
  {
    slug: 'key-chain',
    name: 'Key Chain (x5)',
    tagline: 'A holy pendant that keeps you safe.',
    price: 2,
    details: [],
    colors: [black('merch5-black.webp'), white('merch5-white.webp')],
  },
]

export const CURRENCY = 'USD'

export const formatPrice = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: CURRENCY }).format(value)

export const findProduct = (slug: string | undefined) => merch.find((p) => p.slug === slug)
