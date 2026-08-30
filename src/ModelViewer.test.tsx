// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { ModelViewer } from './App'

afterEach(cleanup)
const props = { src: 'https://example.com/model.glb', iosSrc: '', poster: '', alt: 'Temple model' }

describe('model auto-rotation', () => {
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
