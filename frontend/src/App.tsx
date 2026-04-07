import { useEffect, useMemo, useState } from 'react'
import './App.css'
import EventTable from './components/EventTable'
import LatestEventCard from './components/LatestEventCard'
import SelectFilter from './components/SelectFilter'
import SummaryCard from './components/SummaryCard'
import type { ErrorLogEvent, SummaryMetric } from './types/logs'
import { getLevelRank, getPrimaryService } from './utils/logs'

function App() {
  const [events, setEvents] = useState<ErrorLogEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [serviceFilter, setServiceFilter] = useState('all')
  const [levelFilter, setLevelFilter] = useState('all')

  useEffect(() => {
    const controller = new AbortController()

    async function loadEvents() {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch('/api/error-logs', {
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`)
        }

        const data = (await response.json()) as ErrorLogEvent[]
        setEvents(
          [...data].sort((a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
          ),
        )
      } catch (caughtError) {
        if (caughtError instanceof DOMException && caughtError.name === 'AbortError') {
          return
        }

        setError(
          caughtError instanceof Error
            ? caughtError.message
            : 'Failed to load log events.',
        )
      } finally {
        setIsLoading(false)
      }
    }

    void loadEvents()

    return () => {
      controller.abort()
    }
  }, [])

  const services = useMemo(
    () => Array.from(new Set(events.map((event) => event.service))).sort(),
    [events],
  )

  const levels = useMemo(
    () =>
      Array.from(new Set(events.map((event) => event.level))).sort((a, b) => {
        return getLevelRank(a) - getLevelRank(b) || a.localeCompare(b)
      }),
    [events],
  )

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesService =
        serviceFilter === 'all' || event.service === serviceFilter
      const matchesLevel = levelFilter === 'all' || event.level === levelFilter

      return matchesService && matchesLevel
    })
  }, [events, levelFilter, serviceFilter])

  const metrics = useMemo<SummaryMetric[]>(() => {
    return [
      { label: 'Visible events', value: filteredEvents.length },
      {
        label: 'Error and critical',
        value: filteredEvents.filter((event) =>
          ['error', 'critical'].includes(event.level.toLowerCase()),
        ).length,
      },
      {
        label: 'Tracked levels',
        value: new Set(filteredEvents.map((event) => event.level)).size,
      },
      {
        label: 'Services in view',
        value: new Set(filteredEvents.map((event) => event.service)).size,
      },
    ]
  }, [filteredEvents])

  const primaryService = useMemo(
    () => getPrimaryService(filteredEvents),
    [filteredEvents],
  )

  const latestEvent = filteredEvents[0] ?? null

  return (
    <main className="dashboard-shell">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">Kafka Logging System</p>
          <h1>Log Event Dashboard</h1>
        </div>
        <div className="header-meta">
          <span>Primary service</span>
          <strong>{primaryService}</strong>
        </div>
      </header>

      <section className="dashboard-layout">
        <aside className="sidebar">
          <section className="panel panel-compact">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Overview</p>
                <h2>Current view</h2>
              </div>
            </div>

            <div className="summary-grid" aria-label="Summary">
              {metrics.map((metric) => (
                <SummaryCard key={metric.label} {...metric} />
              ))}
            </div>
          </section>

          <LatestEventCard event={latestEvent} />
        </aside>

        <section className="main-column">
          <section className="panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Filters</p>
                <h2>Focus the event stream</h2>
              </div>
              <span className="event-count">{filteredEvents.length} shown</span>
            </div>

            <div className="filters">
              <SelectFilter
                label="Service"
                value={serviceFilter}
                options={services}
                defaultLabel="All services"
                onChange={setServiceFilter}
              />
              <SelectFilter
                label="Level"
                value={levelFilter}
                options={levels}
                defaultLabel="All levels"
                onChange={setLevelFilter}
              />
            </div>
          </section>

          <section className="panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Event feed</p>
                <h2>Incoming log events</h2>
              </div>
            </div>

            {isLoading ? <div className="state-card">Loading log events...</div> : null}

            {!isLoading && error ? (
              <div className="state-card state-card-error">
                Unable to fetch `/api/error-logs`: {error}
              </div>
            ) : null}

            {!isLoading && !error && filteredEvents.length === 0 ? (
              <div className="state-card">No log events match the current filters.</div>
            ) : null}

            {!isLoading && !error && filteredEvents.length > 0 ? (
              <EventTable events={filteredEvents} />
            ) : null}
          </section>
        </section>
      </section>
    </main>
  )
}

export default App
