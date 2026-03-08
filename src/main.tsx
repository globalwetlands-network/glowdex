import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'
import './styles/globals.css'
import App from './app/App'

const POSTHOG_ENABLED = import.meta.env.VITE_PUBLIC_POSTHOG_ENABLED === 'true'
const POSTHOG_KEY = import.meta.env.VITE_PUBLIC_POSTHOG_KEY
const POSTHOG_HOST = import.meta.env.VITE_PUBLIC_POSTHOG_HOST

const isPostHogConfigured = Boolean(POSTHOG_ENABLED && POSTHOG_KEY && POSTHOG_HOST)

if (isPostHogConfigured) {
  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    capture_pageview: true,
    autocapture: true,
    session_recording: {
      maskAllInputs: true
    }
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isPostHogConfigured ? (
      <PostHogProvider client={posthog}>
        <App />
      </PostHogProvider>
    ) : (
      <App />
    )}
  </StrictMode>,
)
