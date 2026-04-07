import type { ErrorLogEvent } from '../types/logs'

const levelOrder = ['critical', 'error', 'warning', 'info', 'debug']

export function formatTimestamp(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

export function getLevelRank(level: string) {
  const index = levelOrder.indexOf(level.toLowerCase())
  return index === -1 ? levelOrder.length : index
}

export function getPrimaryService(events: ErrorLogEvent[]) {
  const counts = events.reduce<Record<string, number>>((accumulator, event) => {
    accumulator[event.service] = (accumulator[event.service] ?? 0) + 1
    return accumulator
  }, {})

  const [service] =
    Object.entries(counts).sort((left, right) => right[1] - left[1])[0] ?? []

  return service ?? 'None'
}
