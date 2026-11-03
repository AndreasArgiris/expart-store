export type CountryCode = 'MT' | 'HR' | 'DE'

export interface ShopEvent {
  id: number
  venue: string
  city: string
  country: string
  countryCode: CountryCode
  date: string | null // ISO date, null = not announced yet
  time: string
  address: string
  image: string
  /** [longitude, latitude] of the venue, for the globe. */
  coords: [number, number]
}

export const events: ShopEvent[] = [
  {
    id: 1,
    venue: "Big Ron's Records",
    city: 'Valletta',
    country: 'Malta',
    countryCode: 'MT',
    date: '2027-02-14',
    time: '17:00–22:00',
    address: "Ix-Xatt Ta' Xbiex XBX1027",
    image: '/media/products/events/event1.webp',
    coords: [14.4991, 35.9133],
  },
  {
    id: 2,
    venue: 'Dallas Music Shop',
    city: 'Rijeka',
    country: 'Croatia',
    countryCode: 'HR',
    date: '2027-02-18',
    time: '14:00–18:00',
    address: 'Splitska ul. 2A, Rijeka',
    image: '/media/products/events/event2.webp',
    coords: [14.4422, 45.3271],
  },
  {
    id: 3,
    venue: 'Hard Wax',
    city: 'Berlin',
    country: 'Germany',
    countryCode: 'DE',
    date: null,
    time: '12:00–22:00',
    address: 'Köpenicker Str. 70, 10179 Berlin',
    image: '/media/products/events/event3.webp',
    coords: [13.4206, 52.5097],
  },
]

export function formatEventDate(iso: string | null): string {
  if (!iso) return 'Date TBA'
  return new Date(`${iso}T00:00:00`)
    .toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    .toUpperCase()
}

export function mapsUrl(e: ShopEvent): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${e.venue}, ${e.address}`)}`
}

/** Has a confirmed date that is today or later. */
export function isUpcoming(e: ShopEvent, today = new Date()): e is ShopEvent & { date: string } {
  return e.date !== null && e.date >= today.toISOString().slice(0, 10)
}

/** The soonest dated event from today on; falls back to the first listed event. */
export function nextEvent(today = new Date()): ShopEvent {
  const upcoming = events
    .filter((e): e is ShopEvent & { date: string } => isUpcoming(e, today))
    .sort((a, b) => a.date.localeCompare(b.date))
  return upcoming[0] ?? events[0]
}
