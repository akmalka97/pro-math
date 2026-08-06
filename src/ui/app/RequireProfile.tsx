import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAppState } from './AppState'

/**
 * A workbook QR code points straight at a topic, so the first thing a new
 * student ever loads is a deep link with no profile yet. Send them to the
 * picker, remembering where they were going, and finish the journey for them
 * once a profile exists.
 */
export function RequireProfile({ children }: { children: ReactNode }) {
  const { profile } = useAppState()
  const location = useLocation()

  if (!profile) {
    return <Navigate to="/" replace state={{ intended: location.pathname }} />
  }
  return <>{children}</>
}
