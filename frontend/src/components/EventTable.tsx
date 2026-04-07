import type { ErrorLogEvent } from '../types/logs'
import { formatTimestamp } from '../utils/logs'
import LevelBadge from './LevelBadge'

type EventTableProps = {
  events: ErrorLogEvent[]
}

function EventTable({ events }: EventTableProps) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Service</th>
            <th>Level</th>
            <th>Status</th>
            <th>Message</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event, index) => (
            <tr key={`${event.timestamp}-${event.service}-${index}`}>
              <td>{formatTimestamp(event.timestamp)}</td>
              <td>{event.service}</td>
              <td>
                <LevelBadge level={event.level} />
              </td>
              <td>{event.status}</td>
              <td>{event.message}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default EventTable
