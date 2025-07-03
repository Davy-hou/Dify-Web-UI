import { useEffect, RefObject } from 'react'

export function useScrollToBottom(
  ref: RefObject<HTMLElement>,
  deps: any[],
  options = { behavior: 'smooth' as ScrollBehavior }
) {
  useEffect(() => {
    const element = ref.current
    if (!element) return

    // Find the actual scrollable content container
    const viewport = element.querySelector('[data-radix-scroll-area-viewport]')
    const content = viewport?.firstElementChild
    
    if (viewport && content) {
      // Use requestAnimationFrame to ensure the scroll happens after content is rendered
      requestAnimationFrame(() => {
        viewport.scrollTop = content.scrollHeight
      })
    }
  }, deps)
}
