export type Format = 'LP' | 'EP' | 'Single'

export interface Release {
  id: number
  artist: string
  title: string
  format: Format
  released: string // ISO date
  genre: string
  vinyl: string
  cover: string
  preview: string
}

type ReleaseInfo = Omit<Release, 'vinyl' | 'cover' | 'preview'>

const info: ReleaseInfo[] = [
  { id: 1, artist: 'Moon Garden', title: 'Galactic Moonlight', format: 'LP', released: '2026-06-07', genre: 'Instrumental / Folk' },
  { id: 2, artist: 'Tkvo', title: 'Summer', format: 'EP', released: '2012-05-08', genre: 'Electro' },
  { id: 3, artist: 'Verdigris', title: 'Verdigris', format: 'LP', released: '2006-04-14', genre: 'Folk' },
  { id: 4, artist: 'ATS', title: 'After the Static', format: 'Single', released: '2015-04-01', genre: 'Electro / Acid' },
  { id: 5, artist: 'Tidal Oracle', title: 'Tidal Oracle', format: 'LP', released: '2026-10-01', genre: 'Ambient' },
  { id: 6, artist: 'VARGA', title: 'Psychon', format: 'EP', released: '2026-08-18', genre: 'Experimental' },
  { id: 7, artist: 'Moon Garden', title: 'Space in Nature', format: 'LP', released: '2018-11-10', genre: 'Instrumental / Folk' },
  { id: 8, artist: 'June 1', title: 'Underwater Marks', format: 'LP', released: '2023-02-05', genre: 'Gothic' },
  { id: 9, artist: 'Inner Universe', title: "The Soul's Echo", format: 'LP', released: '2020-05-17', genre: 'Experimental' },
  { id: 10, artist: 'Eliza Finn', title: 'Forgetful Hearts', format: 'LP', released: '2017-07-06', genre: 'Synth Pop' },
  { id: 11, artist: 'SIB', title: 'Suns in Bloom', format: 'LP', released: '2019-01-15', genre: 'Folk' },
  { id: 12, artist: 'Cat Nap', title: 'The Purr-fects', format: 'EP', released: '2021-12-31', genre: 'Experimental' },
  { id: 13, artist: 'Aisa', title: 'Jah', format: 'LP', released: '2026-07-01', genre: 'Folk' },
  { id: 14, artist: 'Syagun', title: 'Lovers', format: 'EP', released: '2016-02-14', genre: 'Electro Pop' },
  { id: 15, artist: 'AWT', title: 'Bongas', format: 'EP', released: '2022-08-01', genre: 'Folk' },
  { id: 16, artist: 'Leeyun', title: 'Sparkles', format: 'EP', released: '2017-10-18', genre: 'Traditional' },
  { id: 17, artist: 'Asixz', title: 'Particles', format: 'LP', released: '2020-11-03', genre: 'Electro' },
  { id: 18, artist: 'Saturnal', title: 'Wavy', format: 'LP', released: '2011-04-07', genre: 'Experimental' },
]

// A couple of vinyl files don't follow the vinylN.webp naming.
const vinylFileOverrides: Record<number, string> = {
  2: 'vinyl 2.webp',
  4: 'vinyyl4.webp',
}

const media = (file: string) => encodeURI(`/media/products/${file}`)

export const releases: Release[] = info.map((r) => ({
  ...r,
  vinyl: media(vinylFileOverrides[r.id] ?? `vinyl${r.id}.webp`),
  cover: media(`cover${r.id}.webp`),
  preview: media(`mp3 previews/${r.id}.mp3`),
}))

export function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00`)
    .toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    .toUpperCase()
}
