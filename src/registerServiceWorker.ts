// Set by Capacitor when the app runs inside the Android app instead of a browser.
type CapacitorWindow = Window & { Capacitor?: { isNativePlatform?: () => boolean } }

/** Registers the offline service worker. Production browsers only: never in dev, never inside the native app (it already bundles its files). */
export function registerServiceWorker(): void {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return
  if ((window as CapacitorWindow).Capacitor?.isNativePlatform?.()) return
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {
      // Offline support is an extra; the app works without it.
    })
  })
}
