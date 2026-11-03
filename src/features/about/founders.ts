import type { FlagCode } from '../../shared/components/Flag'

export interface Founder {
  name: string
  /** Where they stand in founders.webp. */
  position: string
  role: string
  age: number
  /** Hometown, if any; the country is shown as a flag. */
  city?: string
  country: string
  flag: FlagCode
  bio: string
}

export const FOUNDERS: Founder[] = [
  {
    name: 'Andreas Duster',
    position: 'Left',
    role: 'Producer & composer',
    age: 34,
    city: 'Piraeus',
    country: 'Greece',
    flag: 'GR',
    bio: 'A producer and composer, always seeking new, talented artists to join the team.',
  },
  {
    name: 'John Chele',
    position: 'Right',
    role: 'Event organizer & merch promoter',
    age: 33,
    city: 'Newry',
    country: 'Northern Ireland',
    flag: 'IE',
    bio: "Organizes Expart's events and promotes its merch.",
  },
]

export const TEAM_SIZE = 34
export const FOUNDERS_PHOTO = { src: '/media/founders.webp', width: 1254, height: 1254 }
