/** Moves keyboard focus to the element matching `selector` once React has re-rendered. */
export function refocusAfterRender(selector: string): void {
  requestAnimationFrame(() => {
    document.querySelector<HTMLElement>(selector)?.focus()
  })
}
