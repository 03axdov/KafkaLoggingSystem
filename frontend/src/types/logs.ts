export type ErrorLogEvent = {
  timestamp: string
  status: number | string
  message: string
  level: string
  service: string
}

export type SummaryMetric = {
  label: string
  value: number
}
