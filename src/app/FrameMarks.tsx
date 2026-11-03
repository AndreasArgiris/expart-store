/** Decorative viewport corner brackets and side ticks. */
export function FrameMarks() {
  return (
    <div aria-hidden="true">
      <span className="vmark vmark-tl" />
      <span className="vmark vmark-tr" />
      <span className="vmark vmark-bl" />
      <span className="vmark vmark-br" />
      <span className="tick tick-l" />
      <span className="tick tick-r" />
    </div>
  )
}
