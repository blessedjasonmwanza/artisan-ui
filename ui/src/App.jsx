import React, { useEffect, useState } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Flex, Box, Spinner } from '@radix-ui/themes'
import api from './api'
import ErrorBoundary from './components/ErrorBoundary'

// Pages (to be created)
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Setup from './pages/Setup'

function App() {
  const [user, setUser] = useState(null)
  const [setupRequired, setSetupRequired] = useState(false)
  const [loading, setLoading] = useState(true)
  const location = useLocation()

  const checkSetupStatus = async () => {
    try {
      const setupResponse = await api.get('/setup-status')
      const { setup_required } = setupResponse?.data || {}
      
      if (setup_required) {
        setSetupRequired(true)
        setLoading(false)
        return
      }

      // Setup is complete, check user
      await checkUser()
    } catch (error) {
      console.error('[App] Setup status check error:', error?.response?.status)
      // If we can't check setup status, try to check user
      await checkUser()
    }
  }

  const checkUser = async () => {
    try {
      const response = await api.get('/user')
      const userData = response?.data
      if (userData && typeof userData === 'object') {
        setUser(userData)
        setSetupRequired(false)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('[App] User check error:', error?.response?.status)
      if (error?.response?.status === 401) {
        setUser(null)
      } else if (error?.response?.status === 0) {
        console.error('[App] Network error checking user')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkSetupStatus()
  }, [location.pathname])

  if (loading) {
    return (
      <Flex align="center" justify="center" style={{ height: '100vh' }}>
        <Spinner size="3" />
      </Flex>
    )
  }

  return (
    <ErrorBoundary>
      <Routes>
        <Route 
          path="/setup" 
          element={setupRequired ? <Setup onSetup={checkSetupStatus} /> : <Navigate to="/" />} 
        />
        <Route 
          path="/login" 
          element={!setupRequired && !user ? <Login onLogin={checkSetupStatus} /> : <Navigate to="/" />} 
        />
        <Route 
          path="/*" 
          element={
            setupRequired ? <Navigate to="/setup" /> : 
            user ? <Dashboard user={user} /> : 
            <Navigate to="/login" />
          } 
        />
      </Routes>
    </ErrorBoundary>
  )
}

export default App
