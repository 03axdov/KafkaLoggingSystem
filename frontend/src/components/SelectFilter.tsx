import { useEffect, useId, useMemo, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'

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
  const [isOpen, setIsOpen] = useState(false)
  const controlRef = useRef<HTMLDivElement>(null)
  const buttonId = useId()
  const listboxId = useId()
  const items = useMemo(
    () => [{ label: defaultLabel, value: 'all' }, ...options.map((option) => ({
      label: option,
      value: option,
    }))],
    [defaultLabel, options],
  )
  const selectedItem =
    items.find((item) => item.value === value) ?? items[0]

  useEffect(() => {
    if (!isOpen) {
      return
    }

    function handlePointerDown(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !controlRef.current?.contains(event.target)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [isOpen])

  function selectItem(nextValue: string) {
    onChange(nextValue)
    setIsOpen(false)
  }

  function handleButtonKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === 'Escape') {
      setIsOpen(false)
      return
    }

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      setIsOpen(true)
    }
  }

  return (
    <div className="filter-control" ref={controlRef}>
      <span id={`${buttonId}-label`}>{label}</span>
      <button
        aria-controls={listboxId}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-labelledby={`${buttonId}-label ${buttonId}`}
        className="filter-select"
        id={buttonId}
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        onKeyDown={handleButtonKeyDown}
      >
        <span>{selectedItem.label}</span>
        <span className="filter-select-chevron" aria-hidden="true" />
      </button>

      {isOpen ? (
        <div
          aria-labelledby={`${buttonId}-label`}
          className="filter-options"
          id={listboxId}
          role="listbox"
          tabIndex={-1}
        >
          {items.map((item) => (
            <button
              aria-selected={item.value === value}
              className={
                item.value === value
                  ? 'filter-option filter-option-active'
                  : 'filter-option'
              }
              key={item.value}
              role="option"
              type="button"
              onClick={() => selectItem(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}

export default SelectFilter
