import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { EventsPage } from './EventsPage'

describe('EventsPage', () => {
  it('shows the first event, and another when it is picked from the list', async () => {
    const user = userEvent.setup()
    render(<EventsPage />)

    expect(await screen.findByText("Big Ron's Records")).toBeInTheDocument()

    const berlin = () => screen.getByRole('button', { name: /^\[3\]\s*Expart Berlin/ })
    await user.click(berlin())
    expect(await screen.findByText('Hard Wax')).toBeInTheDocument()
    expect(berlin()).toHaveAttribute('aria-current', 'true')
  })

  it('steps with the arrow keys and loops round', async () => {
    const user = userEvent.setup()
    render(<EventsPage />)

    await user.keyboard('{ArrowUp}') // back from the first wraps to the last
    expect(await screen.findByText('Hard Wax')).toBeInTheDocument()

    await user.keyboard('{ArrowDown}')
    expect(await screen.findByText("Big Ron's Records")).toBeInTheDocument()
  })
})
