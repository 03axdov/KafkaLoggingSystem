export type ErrorLogEvent = {
  timestamp: string
  status: number | string
  message: string
  level: string
  service: string
}

export type ErrorCount = {
  service: string
  count: number
  created_at: string
}

export type SummaryMetric = {
  label: string
  value: number
}
