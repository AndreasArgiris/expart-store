import { useQuery } from '@tanstack/react-query'
import { fetchWorld, WORLD_ATLAS_QUERY_KEY } from './worldAtlas'

/** The world map for the globe, or null while it loads. It's a static file, so it is fetched once and kept. */
export function useWorldAtlas() {
  const { data } = useQuery({
    queryKey: WORLD_ATLAS_QUERY_KEY,
    queryFn: fetchWorld,
    staleTime: Infinity,
    gcTime: Infinity,
  })
  return data ?? null
}
