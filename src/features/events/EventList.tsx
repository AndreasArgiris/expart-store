import { Flag } from '../../shared/components/Flag'
import { events, formatEventDate } from './events'

interface EventListProps {
  index: number
  onSelect: (index: number) => void
}

/** Numbered list of events with flags; picks the poster to show. Dates show inline on mobile only. */
export function EventList({ index, onSelect }: EventListProps) {
  return (
    <>
      <div className="sq-label mb-4">Upcoming events</div>
      <ol className="list-unstyled mb-0">
        {events.map((e, i) => (
          <li key={e.id}>
            <button
              type="button"
              className={`event-row${i === index ? ' active' : ''}`}
              onClick={() => onSelect(i)}
              aria-current={i === index ? 'true' : undefined}
            >
              <span>[{i + 1}]</span>
              <Flag code={e.countryCode} />
              <span className="text-truncate">Expart {e.city}</span>
              <span className="ms-auto ps-3 d-lg-none">{formatEventDate(e.date)}</span>
            </button>
          </li>
        ))}
      </ol>
    </>
  )
}

/** Desktop-only column of event dates, aligned with the list. Mouse-only: the list already covers keyboards. */
export function EventDates({ index, onSelect }: EventListProps) {
  return (
    <>
      <div className="sq-label mb-4">Date</div>
      <ol className="list-unstyled mb-0">
        {events.map((e, i) => (
          <li key={e.id}>
            <button
              type="button"
              className={`event-row justify-content-end${i === index ? ' active' : ''}`}
              onClick={() => onSelect(i)}
              tabIndex={-1}
            >
              {formatEventDate(e.date)}
            </button>
          </li>
        ))}
      </ol>
    </>
  )
}
