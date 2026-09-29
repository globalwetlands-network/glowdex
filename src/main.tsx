import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';
import './styles/globals.css';
import App from './app/App';
import { Hero } from '@/features/landing/components/Hero';

const POSTHOG_ENABLED = import.meta.env.VITE_PUBLIC_POSTHOG_ENABLED === 'true';
const POSTHOG_KEY = import.meta.env.VITE_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST = import.meta.env.VITE_PUBLIC_POSTHOG_HOST;
const CONFERENCE_MODE = import.meta.env.VITE_PUBLIC_CONFERENCE_MODE === 'true';

const isPostHogConfigured = Boolean(
  POSTHOG_ENABLED && POSTHOG_KEY && POSTHOG_HOST,
);

if (isPostHogConfigured) {
  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    // Client-side routing (/ → /map) needs history-based pageview capture.
    capture_pageview: 'history_change',
    autocapture: true,
    session_recording: {
      maskAllInputs: true,
    },
  });

  if (CONFERENCE_MODE) {
    posthog.group('conference', 'mmm7_2026');
  }
}

const routes = (
  <Routes>
    <Route path="/" element={<Hero />} />
    <Route path="/map" element={<App />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      {isPostHogConfigured ? (
        <PostHogProvider client={posthog}>{routes}</PostHogProvider>
      ) : (
        routes
      )}
    </BrowserRouter>
  </StrictMode>,
);
