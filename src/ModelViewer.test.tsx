// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ModelViewer } from './App'

afterEach(() => { cleanup(); vi.restoreAllMocks(); Reflect.deleteProperty(document, 'fullscreenElement') })
const props = { src: 'https://example.com/model.glb', iosSrc: '', poster: '', alt: 'Temple model' }
beforeEach(() => {
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', { configurable: true, value: function (this: HTMLDialogElement) { this.setAttribute('open', '') } })
  Object.defineProperty(HTMLDialogElement.prototype, 'close', { configurable: true, value: function (this: HTMLDialogElement) { this.removeAttribute('open') } })
})

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

  it('uses the mobile dialog when a fullscreen request is rejected', async () => {
    const { container } = render(<ModelViewer {...props} />)
    Object.defineProperty(container.querySelector('section'), 'requestFullscreen', { value: vi.fn().mockRejectedValue(new Error('Denied')) })
    fireEvent.click(screen.getByRole('button', { name: 'Full screen' }))
    await waitFor(() => expect(screen.getByRole('dialog')).toBeTruthy())
    fireEvent.click(screen.getByRole('button', { name: 'Exit full screen' }))
    expect(screen.queryByRole('dialog')).toBeNull()
  })
  it('supports unavailable fullscreen, rotation, cancel, and scroll restoration', () => {
    render(<ModelViewer {...props} />)
    fireEvent.click(screen.getByRole('button', { name: 'Auto-rotate' }))
    fireEvent.click(screen.getByRole('button', { name: 'Full screen' }))
    const dialog = screen.getByRole('dialog')
    expect(document.body.style.overflow).toBe('hidden')
    expect(dialog.querySelector('model-viewer')!.hasAttribute('auto-rotate')).toBe(true)
    fireEvent.click(screen.getByRole('button', { name: 'Auto-rotate' }))
    expect(dialog.querySelector('model-viewer')!.hasAttribute('auto-rotate')).toBe(false)
    fireEvent(dialog, new Event('cancel', { bubbles: true, cancelable: true }))
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(document.body.style.overflow).toBe('')
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Full screen' }))
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
