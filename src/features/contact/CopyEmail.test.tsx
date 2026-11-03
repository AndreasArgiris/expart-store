import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { CopyEmail } from './CopyEmail'

describe('CopyEmail', () => {
  it('copies the address and confirms it', async () => {
    const user = userEvent.setup() // provides a working clipboard
    render(<CopyEmail email="hello@example.com" />)

    await user.click(screen.getByRole('button', { name: 'hello@example.com' }))

    expect(await navigator.clipboard.readText()).toBe('hello@example.com')
    expect(screen.getByRole('status')).toHaveTextContent('Copied')
  })
})
