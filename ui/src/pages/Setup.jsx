import React, { useState } from 'react'
import { Card, Box, TextField, Button, Text, Heading, Flex, Callout } from '@radix-ui/themes'
import { PersonIcon, EnvelopeClosedIcon, LockClosedIcon, InfoCircledIcon } from '@radix-ui/react-icons'
import api from '../api'

function Setup({ onSetup }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await api.post('/setup', formData)
      onSetup()
    } catch (err) {
      setError(err.response?.data?.message || 'Setup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Flex align="center" justify="center" style={{ height: '100vh' }}>
      <Card size="4" style={{ width: 450 }}>
        <Flex direction="column" gap="4">
          <Box mb="2">
            <Heading size="6" align="center">Welcome to Artisan UI</Heading>
            <Text color="gray" size="2" align="center" as="div">Create the first administrator account to get started</Text>
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
                <Text as="label" size="2" mb="1" weight="bold">Full Name</Text>
                <TextField.Root
                  name="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  required
                >
                  <TextField.Slot>
                    <PersonIcon />
                  </TextField.Slot>
                </TextField.Root>
              </Box>

              <Box>
                <Text as="label" size="2" mb="1" weight="bold">Email Address</Text>
                <TextField.Root
                  name="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={formData.email}
                  onChange={handleChange}
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
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                >
                  <TextField.Slot>
                    <LockClosedIcon />
                  </TextField.Slot>
                </TextField.Root>
              </Box>

              <Box>
                <Text as="label" size="2" mb="1" weight="bold">Confirm Password</Text>
                <TextField.Root
                  name="password_confirmation"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password_confirmation}
                  onChange={handleChange}
                  required
                >
                  <TextField.Slot>
                    <LockClosedIcon />
                  </TextField.Slot>
                </TextField.Root>
              </Box>

              <Button type="submit" size="3" loading={loading} mt="2">
                Create Admin Account
              </Button>
            </Flex>
          </form>
        </Flex>
      </Card>
    </Flex>
  )
}

export default Setup
