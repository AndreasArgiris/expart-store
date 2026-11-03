const CORNERS = ['fc fc-tl', 'fc fc-tr', 'fc fc-bl', 'fc fc-br']

/** The four small corner brackets that frame a box. The parent must be positioned. */
export function CornerMarks() {
  return (
    <>
      {CORNERS.map((className) => (
        <span key={className} className={className} />
      ))}
    </>
  )
}
