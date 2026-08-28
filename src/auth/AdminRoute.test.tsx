// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import AdminRoute from './AdminRoute'

afterEach(cleanup)

describe('AdminRoute', () => {
  it('stays locked when Supabase is not configured', () => {
    render(<MemoryRouter initialEntries={['/admin']}><Routes><Route element={<AdminRoute />}><Route path="/admin" element={<p>Private dashboard</p>} /></Route></Routes></MemoryRouter>)

    expect(screen.getByRole('heading', { name: 'Setup required.' })).toBeTruthy()
    expect(screen.queryByText('Private dashboard')).toBeNull()
  })
})
