import { useMemo, useState } from 'react'
import type { ErrorLogEvent } from '../types/logs'
import { formatTimestamp } from '../utils/logs'
import LevelBadge from './LevelBadge'

type EventTableProps = {
  events: ErrorLogEvent[]
}

const pageSize = 10

function EventTable({ events }: EventTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = Math.max(Math.ceil(events.length / pageSize), 1)
  const activePage = Math.min(currentPage, totalPages)
  const pageStart = (activePage - 1) * pageSize
  const pageEnd = Math.min(pageStart + pageSize, events.length)
  const visibleEvents = useMemo(
    () => events.slice(pageStart, pageEnd),
    [events, pageEnd, pageStart],
  )

  const goToPreviousPage = () => {
    setCurrentPage(Math.max(activePage - 1, 1))
  }

  const goToNextPage = () => {
    setCurrentPage(Math.min(activePage + 1, totalPages))
  }

  return (
    <>
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
            {visibleEvents.map((event, index) => (
              <tr key={`${event.timestamp}-${event.service}-${pageStart + index}`}>
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

      <nav className="pagination" aria-label="Event table pagination">
        <span className="pagination-summary">
          Showing {pageStart + 1}-{pageEnd} of {events.length}
        </span>
        <div className="pagination-controls">
          <button
            className="pagination-button"
            type="button"
            onClick={goToPreviousPage}
            disabled={activePage === 1}
          >
            Previous
          </button>
          <span className="pagination-page">
            Page {activePage} of {totalPages}
          </span>
          <button
            className="pagination-button"
            type="button"
            onClick={goToNextPage}
            disabled={activePage === totalPages}
          >
            Next
          </button>
        </div>
      </nav>
    </>
  )
}

export default EventTable
