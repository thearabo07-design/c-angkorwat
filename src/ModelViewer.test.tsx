// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ModelViewer } from './App'

afterEach(() => { cleanup(); vi.restoreAllMocks(); Reflect.deleteProperty(document, 'fullscreenElement') })
const props = { src: 'https://example.com/model.glb', iosSrc: '', poster: '', alt: 'Temple model' }

describe('model auto-rotation', () => {
  it('requests fullscreen and follows browser exit events without resetting rotation', async () => {
    const { container } = render(<ModelViewer {...props} />)
    const panel = container.querySelector('section')!
    const request = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(panel, 'requestFullscreen', { value: request, configurable: true })
    fireEvent.click(screen.getByRole('button', { name: 'Auto-rotate' }))
    fireEvent.click(screen.getByRole('button', { name: 'Full screen' }))
    expect(request).toHaveBeenCalledOnce()
    Object.defineProperty(document, 'fullscreenElement', { configurable: true, get: () => null })
    const element = vi.spyOn(document, 'fullscreenElement', 'get').mockReturnValue(panel)
    fireEvent(document, new Event('fullscreenchange'))
    expect(screen.getByRole('button', { name: 'Exit full screen' })).toBeTruthy()
    element.mockReturnValue(null)
    fireEvent(document, new Event('fullscreenchange'))
    expect(screen.getByRole('button', { name: 'Full screen' })).toBeTruthy()
    expect(container.querySelector('model-viewer')!.hasAttribute('auto-rotate')).toBe(true)
  })

  it('reports a rejected fullscreen request', async () => {
    const { container } = render(<ModelViewer {...props} />)
    Object.defineProperty(container.querySelector('section'), 'requestFullscreen', { value: vi.fn().mockRejectedValue(new Error('Denied')) })
    fireEvent.click(screen.getByRole('button', { name: 'Full screen' }))
    await waitFor(() => expect(screen.getByRole('status').textContent).toContain('Could not open full screen'))
  })
  it('starts off and toggles without disabling camera or AR controls', () => {
    const { container } = render(<ModelViewer {...props} />)
    const model = container.querySelector('model-viewer')!
    const toggle = screen.getByRole('button', { name: 'Auto-rotate' })
    expect(model.hasAttribute('auto-rotate')).toBe(false)
    expect(toggle.getAttribute('aria-pressed')).toBe('false')
    fireEvent.click(toggle)
    expect(model.hasAttribute('auto-rotate')).toBe(true)
    expect(toggle.textContent).toContain('ON')
    expect(toggle.getAttribute('aria-pressed')).toBe('true')
    fireEvent.click(toggle)
    expect(model.hasAttribute('auto-rotate')).toBe(false)
    expect(toggle.textContent).toContain('OFF')
    expect(model.hasAttribute('camera-controls')).toBe(true)
    expect(model.hasAttribute('ar')).toBe(true)
  })

  it('keeps each model rotation independent', () => {
    const { container } = render(<><ModelViewer {...props} /><ModelViewer {...props} /></>)
    fireEvent.click(screen.getAllByRole('button', { name: 'Auto-rotate' })[0])
    const models = container.querySelectorAll('model-viewer')
    expect(models[0].hasAttribute('auto-rotate')).toBe(true)
    expect(models[1].hasAttribute('auto-rotate')).toBe(false)
  })
})
