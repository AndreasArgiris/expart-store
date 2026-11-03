import { useRef } from 'react'
import { formatEventDate, type ShopEvent } from '../../events/events'
import { useGlobeLoop } from './useGlobeLoop'
import { useGlobePointer } from './useGlobePointer'
import { useWorldAtlas } from './useWorldAtlas'

interface GlobeProps {
  size: number
  pins: ShopEvent[]
  /** Called every frame with the [lon, lat] currently facing the viewer. */
  onCenterChange?: (lon: number, lat: number) => void
  onPinClick?: (event: ShopEvent) => void
}

/**
 * Slowly rotating orthographic globe with a red square pin per event. Drag to spin it, hover a pin
 * for its name and date (rotation slows down while the pointer is over the globe).
 */
export function Globe({ size, pins, onCenterChange, onPinClick }: GlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const world = useWorldAtlas()
  const { spin, positions, hovered, handlers } = useGlobePointer(onPinClick)
  useGlobeLoop({ canvasRef, tooltipRef, world, size, pins, hovered, spin, positions, onCenterChange })

  return (
    <div className="globe" style={{ width: size, height: size }}>
      <canvas
        ref={canvasRef}
        className="globe-canvas"
        style={{ width: size, height: size, cursor: hovered ? 'pointer' : 'grab' }}
        role="img"
        aria-label={`Globe showing ${pins.length} event locations: ${pins.map((p) => p.city).join(', ')}`}
        {...handlers}
      />
      <div ref={tooltipRef} className="globe-tooltip" style={{ opacity: hovered ? 1 : 0 }} aria-hidden="true">
        {hovered && (
          <>
            <div className="sq-label">Expart {hovered.city}</div>
            <div>{formatEventDate(hovered.date)}</div>
          </>
        )}
      </div>
    </div>
  )
}
