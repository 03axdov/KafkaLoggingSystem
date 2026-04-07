import type { SummaryMetric } from '../types/logs'

function SummaryCard({ label, value }: SummaryMetric) {
  return (
    <article className="summary-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  )
}

export default SummaryCard
