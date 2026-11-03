import type { GeoPermissibleObjects } from 'd3-geo'
import { feature, mesh } from 'topojson-client'
import type { GeometryCollection, Topology } from 'topojson-specification'
import worldUrl from 'world-atlas/countries-110m.json?url'

/** Land and country borders, ready for d3-geo to draw. */
export interface World {
  land: GeoPermissibleObjects
  borders: GeoPermissibleObjects
}

export const WORLD_ATLAS_QUERY_KEY = ['world-atlas', 'countries-110m'] as const

const isObject = (v: unknown): v is object => typeof v === 'object' && v !== null

/** Checks the fetched JSON really is a TopoJSON topology with a `countries` collection before we trust it. */
function isCountriesTopology(data: unknown): data is Topology<{ countries: GeometryCollection }> {
  if (!isObject(data) || !('type' in data) || data.type !== 'Topology') return false
  if (!('arcs' in data) || !Array.isArray(data.arcs) || !('objects' in data) || !isObject(data.objects)) return false
  if (!('countries' in data.objects) || !isObject(data.objects.countries)) return false
  const { countries } = data.objects
  return 'type' in countries && countries.type === 'GeometryCollection' && 'geometries' in countries && Array.isArray(countries.geometries)
}

/** Loads the bundled world atlas and turns it into land + borders. Throws if it can't be loaded or parsed. */
export async function fetchWorld(): Promise<World> {
  const res = await fetch(worldUrl)
  if (!res.ok) throw new Error(`World atlas request failed: ${res.status}`)
  const data: unknown = await res.json()
  if (!isCountriesTopology(data)) throw new Error('World atlas has an unexpected format')

  const { countries } = data.objects
  return {
    land: feature(data, countries),
    borders: mesh(data, countries, (a, b) => a !== b),
  }
}
