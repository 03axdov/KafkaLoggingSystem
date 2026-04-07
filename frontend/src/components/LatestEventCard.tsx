import type { ErrorLogEvent } from '../types/logs'
import { formatTimestamp } from '../utils/logs'
import LevelBadge from './LevelBadge'

type LatestEventCardProps = {
  event: ErrorLogEvent | null
}

function LatestEventCard({ event }: LatestEventCardProps) {
  return (
    <div className="hero-panel">
      <span className="hero-label">Latest event</span>
      {event ? (
        <>
          <div className="hero-panel-topline">
            <strong>{event.service}</strong>
            <LevelBadge level={event.level} />
          </div>
          <p>{event.message}</p>
          <div className="hero-meta">
            <span>Status {event.status}</span>
            <span>{formatTimestamp(event.timestamp)}</span>
          </div>
        </>
      ) : (
        <p>No matching events available.</p>
      )}
    </div>
  )
}

export default LatestEventCard
