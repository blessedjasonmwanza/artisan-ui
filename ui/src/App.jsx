import React, { useEffect, useState } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Flex, Box, Spinner, Callout } from '@radix-ui/themes'
import { InfoCircledIcon } from '@radix-ui/react-icons'
import api from './api'
import ErrorBoundary from './components/ErrorBoundary'

// Pages (to be created)
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Setup from './pages/Setup'

function App() {
  const [user, setUser] = useState(null)
  const [setupRequired, setSetupRequired] = useState(null)
  const [initialized, setInitialized] = useState(false)
  const [initError, setInitError] = useState(false)
  const [loading, setLoading] = useState(true)
  const location = useLocation()

  const checkSetupStatus = async () => {
    try {
      const setupResponse = await api.get('/setup-status')
      const { setup_required, auth_disabled } = setupResponse?.data || {}
      
      setSetupRequired(!!setup_required)
      
      if (setup_required) {
        setInitialized(true)
        setLoading(false)
        return
      }

      // If auth is disabled, skip user check and show dashboard
      if (auth_disabled) {
        setUser({ id: 1, name: 'Admin', email: 'admin@example.com' })
        setInitialized(true)
        setLoading(false)
        return
      }

      // Setup is complete, check user
      await checkUser()
    } catch (error) {
      console.error('[App] Setup status check failed:', error)
      setInitError(true)
      setInitialized(true)
      setLoading(false)
    }
  }

  const checkUser = async () => {
    try {
      const response = await api.get('/user')
      const userData = response?.data
      if (userData && typeof userData === 'object') {
        setUser(userData)
      } else {
        setUser(null)
      }
    } catch (error) {
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        setUser(null)
      }
    } finally {
      setInitialized(true)
      setLoading(false)
    }
  }

  useEffect(() => {
    checkSetupStatus()
  }, [location.pathname])

  if (!initialized || loading) {
    return (
      <Flex align="center" justify="center" style={{ height: '100vh' }}>
        <Spinner size="3" />
      </Flex>
    )
  }

  if (initError) {
    return (
      <Flex align="center" justify="center" style={{ height: '100vh' }}>
        <Callout.Root color="red">
          <Callout.Icon><InfoCircledIcon /></Callout.Icon>
          <Callout.Text>
            Failed to connect to Artisan UI API. Please check your installation.
          </Callout.Text>
        </Callout.Root>
      </Flex>
    )
  }

  return (
    <ErrorBoundary>
      <Routes>
        <Route 
          path="/setup" 
          element={
            setupRequired === true ? <Setup onSetup={checkSetupStatus} /> : 
            setupRequired === false ? <Navigate to="/" /> : 
            null
          } 
        />
        <Route 
          path="/login" 
          element={
            setupRequired === false && !user ? <Login onLogin={checkSetupStatus} /> : 
            setupRequired === true ? <Navigate to="/setup" /> : 
            user ? <Navigate to="/" /> :
            null
          } 
        />
        <Route 
          path="/*" 
          element={
            setupRequired === true ? <Navigate to="/setup" /> : 
            setupRequired === false ? (user ? <Dashboard user={user} /> : <Navigate to="/login" />) : 
            null
          } 
        />
      </Routes>
    </ErrorBoundary>
  )
}

export default App
