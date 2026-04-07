type SelectFilterProps = {
  label: string
  value: string
  options: string[]
  defaultLabel: string
  onChange: (value: string) => void
}

function SelectFilter({
  label,
  value,
  options,
  defaultLabel,
  onChange,
}: SelectFilterProps) {
  return (
    <label className="filter-control">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="all">{defaultLabel}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  )
}

export default SelectFilter
