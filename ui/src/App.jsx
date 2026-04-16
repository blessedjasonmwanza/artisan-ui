import React, { useEffect, useState } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Flex, Box, Spinner } from '@radix-ui/themes'
import api from './api'

// Pages (to be created)
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Setup from './pages/Setup'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [needsSetup, setNeedsSetup] = useState(false)
  const location = useLocation()

  const checkUser = async () => {
    try {
      const response = await api.get('/user')
      setUser(response.data)
      setNeedsSetup(false)
    } catch (error) {
      if (error.response?.status === 401) {
        setUser(null)
      } else if (error.response?.status === 404) {
        // This might happen if common routes aren't set up, 
        // but our middleware should handle the setup redirect.
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkUser()
  }, [location.pathname])

  if (loading) {
    return (
      <Flex align="center" justify="center" style={{ height: '100vh' }}>
        <Spinner size="3" />
      </Flex>
    )
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login onLogin={checkUser} />} />
      <Route path="/setup" element={<Setup onSetup={checkUser} />} />
      <Route 
        path="/*" 
        element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} 
      />
    </Routes>
  )
}

export default App
