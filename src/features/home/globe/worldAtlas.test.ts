import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchWorld } from './worldAtlas'

const respondWith = (body: unknown, ok = true) =>
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({ ok, status: ok ? 200 : 500, json: async () => body })),
  )

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('fetchWorld', () => {
  it('turns a countries topology into land and borders', async () => {
    respondWith({
      type: 'Topology',
      arcs: [
        [
          [0, 0],
          [1, 0],
          [0, 1],
          [-1, -1],
        ],
      ],
      objects: { countries: { type: 'GeometryCollection', geometries: [{ type: 'Polygon', arcs: [[0]] }] } },
    })
    const world = await fetchWorld()
    expect(world.land).toMatchObject({ type: 'FeatureCollection' })
    expect(world.borders).toMatchObject({ type: 'MultiLineString' })
  })

  it('rejects data that is not a countries topology', async () => {
    respondWith({ type: 'Topology', arcs: [], objects: {} })
    await expect(fetchWorld()).rejects.toThrow('unexpected format')
  })

  it('rejects a failed request', async () => {
    respondWith(null, false)
    await expect(fetchWorld()).rejects.toThrow('500')
  })
})
