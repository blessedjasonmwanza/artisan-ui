import React, { useEffect, useState, useCallback } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Flex, Box, Spinner, Callout } from '@radix-ui/themes'
import { InfoCircledIcon } from '@radix-ui/react-icons'
import api from './api'
import ErrorBoundary from './components/ErrorBoundary'

// Pages
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Setup from './pages/Setup'

/**
 * Auth state enum - backend tells frontend which page to render
 * This is the single source of truth, preventing race conditions
 */
const AUTH_STATES = {
  LOADING: 'loading',      // Initial state, waiting for backend response
  SETUP: 'setup',          // No users in the system, setup is required
  LOGIN: 'login',          // Users exist but current session is not authenticated
  DASHBOARD: 'dashboard',  // User is authenticated and can access dashboard
  ERROR: 'error'           // Failed to get auth state from backend
}

function App() {
  // Single source of truth: the state from the backend
  const [authState, setAuthState] = useState(AUTH_STATES.LOADING)
  const [user, setUser] = useState(null)
  const [error, setError] = useState(null)

  /**
   * Fetch the current authentication state from the backend
   * The backend determines which page should be rendered
   * This is called on mount and after login/logout/setup actions
   */
  const fetchAuthState = useCallback(async () => {
    try {
      setAuthState(AUTH_STATES.LOADING)
      setError(null)

      const response = await api.get('/auth-state')
      const responseData = response?.data || {}
      const { state, user: userData, auth_disabled } = responseData

      // Log for debugging
      console.log('[App] Auth state response:', { state, hasUser: !!userData, auth_disabled })

      // Handle error responses (e.g., 403 when setup not complete or HTML returned)
      if (!state) {
        console.error('[App] Missing state in response:', responseData)
        
        // If we got an HTML response instead of JSON, identify it
        if (typeof responseData === 'string' && responseData.trim().startsWith('<!DOCTYPE html>')) {
          console.error('[App] Received HTML instead of JSON. This usually indicates a routing conflict.')
          throw new Error('Server returned HTML instead of JSON. Please check your route configuration.')
        }

        // If we got a setup_required flag, handle that
        if (responseData.setup_required === true) {
          console.log('[App] Setup required from error response')
          setAuthState(AUTH_STATES.SETUP)
          setUser(null)
          return
        }
        
        throw new Error('Invalid auth state from backend: missing state field')
      }

      // Validate state value
      if (!Object.values(AUTH_STATES).includes(state)) {
        console.error('[App] Invalid state value:', state, 'Expected one of:', Object.values(AUTH_STATES))
        throw new Error(`Invalid auth state from backend: state="${state}" is not valid`)
      }

      // Update state based on backend response
      setAuthState(state)
      setUser(userData || null)

    } catch (err) {
      console.error('[App] Failed to fetch auth state:', err?.message, err?.response?.data)
      setAuthState(AUTH_STATES.ERROR)
      setError(err?.response?.data?.message || err.message || 'Failed to connect to server')
      setUser(null)
    }
  }, [])

  /**
   * Callback for when setup is completed successfully
   * This refetches the auth state to determine next page (should be login)
   */
  const handleSetupComplete = useCallback(async () => {
    await fetchAuthState()
  }, [fetchAuthState])

  /**
   * Callback for when login is completed successfully
   * This refetches the auth state to determine next page (should be dashboard)
   */
  const handleLoginComplete = useCallback(async () => {
    await fetchAuthState()
  }, [fetchAuthState])

  /**
   * Callback for when logout is triggered
   * This refetches the auth state to determine next page (should be login)
   */
  const handleLogout = useCallback(async () => {
    await fetchAuthState()
  }, [fetchAuthState])

  /**
   * Fetch auth state on initial mount
   * Only run once on mount, not on location changes
   * The SPA router handles navigation client-side after initial load
   */
  useEffect(() => {
    fetchAuthState()
  }, [])

  /**
   * Render logic based on auth state from backend
   * This ensures the UI always renders what the backend says it should
   */

  // Loading state: show spinner while fetching auth state
  if (authState === AUTH_STATES.LOADING) {
    return (
      <Flex align="center" justify="center" style={{ height: '100vh' }}>
        <Spinner size="3" />
      </Flex>
    )
  }

  // Error state: show error message
  if (authState === AUTH_STATES.ERROR) {
    return (
      <Flex align="center" justify="center" style={{ height: '100vh' }}>
        <Callout.Root color="red">
          <Callout.Icon><InfoCircledIcon /></Callout.Icon>
          <Callout.Text>
            {error || 'Failed to connect to Artisan UI API. Please check your installation.'}
          </Callout.Text>
        </Callout.Root>
      </Flex>
    )
  }

  // Render routes based on backend-determined state
  // This prevents client-side redirect logic that can cause race conditions
  return (
    <ErrorBoundary>
      <Routes>
        {/* Setup page: only shown when authState is SETUP */}
        <Route 
          path="/setup" 
          element={
            authState === AUTH_STATES.SETUP 
              ? <Setup onSetup={handleSetupComplete} />
              : <Navigate to="/" replace />
          } 
        />

        {/* Login page: only shown when authState is LOGIN */}
        <Route 
          path="/login" 
          element={
            authState === AUTH_STATES.LOGIN 
              ? <Login onLogin={handleLoginComplete} />
              : <Navigate to="/" replace />
          } 
        />

        {/* Dashboard and other pages: only shown when authState is DASHBOARD */}
        <Route 
          path="/*" 
          element={
            authState === AUTH_STATES.DASHBOARD 
              ? <Dashboard user={user} onLogout={handleLogout} />
              : <Navigate to="/" replace />
          } 
        />
      </Routes>
    </ErrorBoundary>
  )
}

export default App
