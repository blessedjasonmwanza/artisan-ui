import React, { useState } from 'react'
import { Card, Box, TextField, Button, Text, Heading, Flex, Callout } from '@radix-ui/themes'
import { EnvelopeClosedIcon, LockClosedIcon, InfoCircledIcon } from '@radix-ui/react-icons'
import api from '../api'

function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await api.post('/login', { email, password })
      onLogin()
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Flex align="center" justify="center" style={{ height: '100vh' }}>
      <Card size="4" style={{ width: 400 }}>
        <Flex direction="column" gap="4">
          <Box mb="2">
            <Heading size="6" align="center">Artisan UI</Heading>
            <Text color="gray" size="2" align="center" as="div">Sign in to manage your commands</Text>
          </Box>

          {error && (
            <Callout.Root color="red" variant="soft">
              <Callout.Icon>
                <InfoCircledIcon />
              </Callout.Icon>
              <Callout.Text>{error}</Callout.Text>
            </Callout.Root>
          )}

          <form onSubmit={handleSubmit}>
            <Flex direction="column" gap="3">
              <Box>
                <Text as="label" size="2" mb="1" weight="bold">Email Address</Text>
                <TextField.Root
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                >
                  <TextField.Slot>
                    <EnvelopeClosedIcon />
                  </TextField.Slot>
                </TextField.Root>
              </Box>

              <Box>
                <Text as="label" size="2" mb="1" weight="bold">Password</Text>
                <TextField.Root
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                >
                  <TextField.Slot>
                    <LockClosedIcon />
                  </TextField.Slot>
                </TextField.Root>
              </Box>

              <Button type="submit" size="3" loading={loading}>
                Sign In
              </Button>
            </Flex>
          </form>
        </Flex>
      </Card>
    </Flex>
  )
}

export default Login
