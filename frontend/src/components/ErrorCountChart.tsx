import { LineChart, type LineChartProps } from '@mui/x-charts'
import type { ErrorCount } from '../types/logs'

type ErrorCountChartProps = {
  errorCounts: ErrorCount[]
  asOf: number
}

const chartColors = [
  '#f08a9d',
  '#8fc7ff',
  '#f4c76f',
  '#93dda5',
  '#c2a2ff',
  '#ffad7a',
]

function formatTick(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function formatChartDate(value: Date) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(value)
}

function ErrorCountChart({ errorCounts, asOf }: ErrorCountChartProps) {
  const validErrorCounts = errorCounts
    .map((errorCount) => ({
      ...errorCount,
      timestamp: new Date(errorCount.created_at).getTime(),
    }))
    .filter((errorCount) => !Number.isNaN(errorCount.timestamp))
    .sort((left, right) => left.timestamp - right.timestamp)

  if (validErrorCounts.length === 0) {
    return <div className="state-card">No error count data available yet.</div>
  }

  const serviceNames = Array.from(
    new Set(validErrorCounts.map((errorCount) => errorCount.service)),
  ).sort()

  const timeline = Array.from(
    new Set([...validErrorCounts.map((errorCount) => errorCount.timestamp), asOf]),
  ).sort((left, right) => left - right)

  const xAxisData = timeline.map((timestamp) => new Date(timestamp))
  const series: LineChartProps['series'] = serviceNames.map(
    (serviceName, serviceIndex) => {
      let latestCount: number | null = null
      const serviceCountsByTimestamp = new Map(
        validErrorCounts
          .filter((errorCount) => errorCount.service === serviceName)
          .map((errorCount) => [errorCount.timestamp, errorCount.count]),
      )

      return {
        id: serviceName,
        label: serviceName,
        color: chartColors[serviceIndex % chartColors.length],
        curve: 'stepAfter',
        showMark: true,
        connectNulls: true,
        data: timeline.map((timestamp) => {
          latestCount = serviceCountsByTimestamp.get(timestamp) ?? latestCount
          return latestCount
        }),
        valueFormatter: (value) =>
          value === null ? null : `${value} errors`,
      }
    },
  )

  return (
    <div className="error-chart-card">
      <div className="error-chart-wrap">
        <LineChart
          height={360}
          margin={{ top: 28, right: 28, bottom: 68, left: 56 }}
          xAxis={[
            {
              id: 'time',
              data: xAxisData,
              scaleType: 'time',
              valueFormatter: (value) => formatTick(value.toISOString()),
            },
          ]}
          yAxis={[{ id: 'errors', min: 0 }]}
          series={series}
          grid={{ horizontal: true, vertical: true }}
          axisHighlight={{ x: 'line' }}
          skipAnimation
          sx={{
            color: '#dce6f7',
            '& text': { fill: '#dce6f7' },
            '& .MuiChartsAxis-line': { stroke: '#536783' },
            '& .MuiChartsAxis-tick': { stroke: '#536783' },
            '& .MuiChartsAxis-tickLabel': { fill: '#aab8cf' },
            '& .MuiChartsAxis-label': { fill: '#aab8cf' },
            '& .MuiChartsLegend-label': { fill: '#dce6f7' },
            '& .MuiChartsGrid-line': { stroke: 'rgba(88, 117, 170, 0.18)' },
          }}
        />
      </div>

      <p className="chart-note">
        Counts carry forward between updates. Latest sample:{' '}
        {formatChartDate(new Date(timeline[timeline.length - 1]))}
      </p>
    </div>
  )
}

export default ErrorCountChart
