import { useCallback, useEffect, useMemo, useState } from 'react'
import './App.css'
import ErrorCountChart from './components/ErrorCountChart'
import EventTable from './components/EventTable'
import LatestEventCard from './components/LatestEventCard'
import SelectFilter from './components/SelectFilter'
import SummaryCard from './components/SummaryCard'
import type { ErrorCount, ErrorLogEvent, SummaryMetric } from './types/logs'
import { getLevelRank } from './utils/logs'

const refreshIntervalMs = 3000

function App() {
  const [events, setEvents] = useState<ErrorLogEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [errorCounts, setErrorCounts] = useState<ErrorCount[]>([])
  const [areErrorCountsLoading, setAreErrorCountsLoading] = useState(true)
  const [errorCountsError, setErrorCountsError] = useState<string | null>(null)
  const [serviceFilter, setServiceFilter] = useState('all')
  const [levelFilter, setLevelFilter] = useState('all')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdatedAt, setLastUpdatedAt] = useState(Date.now())
  const [now, setNow] = useState(Date.now())

  const loadEvents = useCallback(async (signal: AbortSignal, showLoading: boolean) => {
    if (showLoading) {
      setIsLoading(true)
    }
    setError(null)

    try {
      const response = await fetch('/api/logs', {
        signal,
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
      if (showLoading) {
        setIsLoading(false)
      }
    }
  }, [])

  const loadErrorCounts = useCallback(
    async (signal: AbortSignal, showLoading: boolean) => {
      if (showLoading) {
        setAreErrorCountsLoading(true)
      }
      setErrorCountsError(null)

      try {
        const response = await fetch('/api/error-counts', {
          signal,
        })

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`)
        }

        const data = (await response.json()) as ErrorCount[]
        setErrorCounts(
          [...data].sort((a, b) => {
            return (
              new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            )
          }),
        )
      } catch (caughtError) {
        if (caughtError instanceof DOMException && caughtError.name === 'AbortError') {
          return
        }

        setErrorCountsError(
          caughtError instanceof Error
            ? caughtError.message
            : 'Failed to load error counts.',
        )
      } finally {
        if (showLoading) {
          setAreErrorCountsLoading(false)
        }
      }
    },
    [],
  )

  const loadDashboardData = useCallback(
    async (signal: AbortSignal, showLoading: boolean) => {
      setIsRefreshing(true)
      await Promise.all([
        loadEvents(signal, showLoading),
        loadErrorCounts(signal, showLoading),
      ])

      if (!signal.aborted) {
        const updatedAt = Date.now()
        setLastUpdatedAt(updatedAt)
        setNow(updatedAt)
        setIsRefreshing(false)
      }
    },
    [loadErrorCounts, loadEvents],
  )

  useEffect(() => {
    const controller = new AbortController()
    const refreshControllers = new Set<AbortController>()

    void loadDashboardData(controller.signal, true)

    const refreshId = window.setInterval(() => {
      const refreshController = new AbortController()
      refreshControllers.add(refreshController)
      void loadDashboardData(refreshController.signal, false).finally(() => {
        refreshControllers.delete(refreshController)
      })
    }, refreshIntervalMs)

    return () => {
      controller.abort()
      refreshControllers.forEach((refreshController) => {
        refreshController.abort()
      })
      window.clearInterval(refreshId)
    }
  }, [loadDashboardData])

  useEffect(() => {
    const tickId = window.setInterval(() => {
      setNow(Date.now())
    }, 250)

    return () => {
      window.clearInterval(tickId)
    }
  }, [])

  const refreshProgress = Math.min(
    ((now - lastUpdatedAt) / refreshIntervalMs) * 100,
    100,
  )
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

  const latestEvent = filteredEvents[0] ?? null

  return (
    <main className="dashboard-shell">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">Kafka Logging System</p>
          <h1>Log Event Dashboard</h1>
        </div>
      </header>

      <section className="refresh-panel" aria-label="Dashboard update progress">
        <div className="refresh-track" aria-hidden="true">
          <div
            className="refresh-fill"
            style={{ width: `${isRefreshing ? 100 : refreshProgress}%` }}
          />
        </div>
      </section>

      <section className="dashboard-section" aria-labelledby="errors-section-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Errors</p>
            <h2 id="errors-section-title">Error counts over time</h2>
          </div>
          <span className="event-count">{errorCounts.length} samples</span>
        </div>

        <section className="panel">
          {areErrorCountsLoading ? (
            <div className="state-card">Loading error counts...</div>
          ) : null}

          {!areErrorCountsLoading && errorCountsError ? (
            <div className="state-card state-card-error">
              Unable to fetch `/api/error-counts`: {errorCountsError}
            </div>
          ) : null}

          {!areErrorCountsLoading && !errorCountsError ? (
            <ErrorCountChart errorCounts={errorCounts} asOf={lastUpdatedAt} />
          ) : null}
        </section>
      </section>

      <section className="dashboard-section" aria-labelledby="logs-section-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">General logs</p>
            <h2 id="logs-section-title">All log events</h2>
          </div>
        </div>

        <div className="dashboard-layout">
          <aside className="sidebar">
            <section className="panel panel-compact">
              <div className="panel-header">
                <div>
                  <p className="eyebrow">Overview</p>
                  <h3>Current view</h3>
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
                  <h3>Focus the event stream</h3>
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
                  <h3>Incoming log events</h3>
                </div>
              </div>

              {isLoading ? <div className="state-card">Loading log events...</div> : null}

              {!isLoading && error ? (
                <div className="state-card state-card-error">
                  Unable to fetch `/api/logs`: {error}
                </div>
              ) : null}

              {!isLoading && !error && filteredEvents.length === 0 ? (
                <div className="state-card">
                  No log events match the current filters.
                </div>
              ) : null}

              {!isLoading && !error && filteredEvents.length > 0 ? (
                <EventTable events={filteredEvents} />
              ) : null}
            </section>
          </section>
        </div>
      </section>
    </main>
  )
}

export default App
