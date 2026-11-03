import { CornerMarks } from '../../../shared/components/CornerMarks'

interface SizePickerProps {
  sizes: string[]
  value: string | null
  onChange: (size: string) => void
}

/** One button per size, as a radio group; the picked size is framed with corner marks. */
export function SizePicker({ sizes, value, onChange }: SizePickerProps) {
  return (
    <div className="pdp-option">
      <div className="pdp-option-label">Size{value ? `: ${value}` : ''}</div>
      <div className="sizes" role="radiogroup" aria-label="Size">
        {sizes.map((s) => {
          const isPicked = s === value
          return (
            <button
              key={s}
              type="button"
              role="radio"
              aria-checked={isPicked}
              className={`size-opt${isPicked ? ' is-active' : ''}`}
              onClick={() => onChange(s)}
            >
              {isPicked && <CornerMarks />}
              {s}
            </button>
          )
        })}
      </div>
    </div>
  )
}
