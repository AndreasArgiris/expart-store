import { EventDates, EventList } from './EventList'
import { EventStage } from './EventStage'
import { useEventCarousel } from './useEventCarousel'
import { usePosterMetrics } from './usePosterMetrics'

/** Events: a vertical poster carousel between the event list and their dates. Wheel, arrows or click to move. */
export function EventsPage() {
  const { index, setIndex, handleWheel } = useEventCarousel()
  const metrics = usePosterMetrics()

  return (
    <main className="flex-grow-1 d-flex align-items-center" onWheel={handleWheel}>
      <div className="row g-0 align-items-center w-100 gy-5">
        <div className="col-12 col-lg-3 order-2 order-lg-1 events-side">
          <EventList index={index} onSelect={setIndex} />
        </div>

        <div className="col-12 col-lg-6 order-1 order-lg-2 d-flex justify-content-center">
          <EventStage index={index} metrics={metrics} onSelect={setIndex} />
        </div>

        <div className="col-lg-3 order-3 d-none d-lg-block events-side text-end">
          <EventDates index={index} onSelect={setIndex} />
        </div>
      </div>
    </main>
  )
}
