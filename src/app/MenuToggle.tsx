interface MenuToggleProps {
  isOpen: boolean
  menuId: string
  onToggle: () => void
}

/** The burger button, mobile only; its three bars fold into a cross while the menu is open. */
export function MenuToggle({ isOpen, menuId, onToggle }: MenuToggleProps) {
  return (
    <button
      type="button"
      className="menu-toggle col-auto d-lg-none"
      aria-label={isOpen ? 'Close menu' : 'Open menu'}
      aria-expanded={isOpen}
      aria-controls={menuId}
      onClick={onToggle}
    >
      <span className="menu-toggle-bars" aria-hidden="true" />
    </button>
  )
}
