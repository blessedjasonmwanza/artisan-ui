import React, { useState, useEffect } from 'react'
import { Box, Flex, ScrollArea, Heading, Text, Badge, Card, IconButton, Tooltip, Avatar, DropdownMenu, Button, SegmentedControl, TextField, Table } from '@radix-ui/themes'
import { MagnifyingGlassIcon, PlayIcon, ListBulletIcon, CounterClockwiseClockIcon, ExitIcon, ChevronRightIcon, ExternalLinkIcon, CubeIcon } from '@radix-ui/react-icons'
import api from '../api'
import { toArray } from '../utils/dataValidation'
import CommandSidebar from '../components/CommandSidebar'
import CommandExecution from '../components/CommandExecution'
import LogViewer from '../components/LogViewer'

function Dashboard({ user, onLogout }) {
  const [commands, setCommands] = useState([])
  const [selectedCommand, setSelectedCommand] = useState(null)
  const [view, setView] = useState('execute') // 'execute' or 'logs'
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchCommands = async () => {
    setError(null)
    try {
      const response = await api.get('/commands')
      const data = toArray(response.data)
      
      // Validate that all items are valid commands
      const validCommands = data.filter(cmd => 
        cmd && typeof cmd === 'object' && cmd.name && cmd.description
      )
      
      setCommands(validCommands)
      
      if (validCommands.length === 0) {
        console.warn('[Dashboard] No valid commands returned from API')
      }
    } catch (err) {
      console.error('[Dashboard] Failed to fetch commands:', err)
      setError(err?.response?.data?.message || 'Failed to load commands')
      setCommands([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCommands()
  }, [])

  const handleLogout = async () => {
    try {
      await api.post('/logout')
      // Call the callback to refresh auth state in App component
      // This will trigger redirect to login page via auth-state endpoint
      if (onLogout) {
        await onLogout()
      } else {
        // Fallback: reload page if callback not provided
        window.location.reload()
      }
    } catch (err) {
      console.error('[Dashboard] Logout error:', err)
      // Force logout on error via callback
      if (onLogout) {
        await onLogout()
      } else {
        window.location.reload()
      }
    }
  }

  return (
    <Flex direction="column" style={{ height: '100vh' }}>
      {/* Header */}
      <Flex p="3" justify="between" align="center" style={{ borderBottom: '1px solid var(--gray-4)', background: 'var(--gray-2)' }}>
        <Flex align="center" gap="2">
          <Box p="1" style={{ background: 'var(--indigo-9)', borderRadius: 'var(--radius-2)' }}>
            <CubeIcon color="white" width="18" height="18" />
          </Box>
          <Heading size="4" weight="bold">Artisan UI</Heading>
        </Flex>

        <Flex align="center" gap="4">
          <SegmentedControl.Root value={view} onValueChange={setView}>
            <SegmentedControl.Item value="execute">
              <Flex align="center" gap="1">
                <PlayIcon /> Execute
              </Flex>
            </SegmentedControl.Item>
            <SegmentedControl.Item value="logs">
              <Flex align="center" gap="1">
                <CounterClockwiseClockIcon /> Logs
              </Flex>
            </SegmentedControl.Item>
          </SegmentedControl.Root>

          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <Flex align="center" gap="2" style={{ cursor: 'pointer' }}>
                <Avatar size="2" src={user?.avatar} fallback={user?.name?.[0]?.toUpperCase() || 'U'} radius="full" color="indigo" />
                <Text size="2" weight="medium">{user?.name || user?.email || 'User'}</Text>
              </Flex>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content size="2">
              <DropdownMenu.Item onClick={handleLogout} color="red">
                <ExitIcon /> Sign Out
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </Flex>
      </Flex>

      {/* Error banner */}
      {error && (
        <Box p="3" style={{ background: 'var(--red-3)', borderBottom: '1px solid var(--red-5)' }}>
          <Text size="2" color="red" weight="medium">{error}</Text>
        </Box>
      )}

      {/* Main Content */}
      <Flex style={{ flex: 1, overflow: 'hidden' }}>
        <Box width="300px" style={{ borderRight: '1px solid var(--gray-4)', background: 'var(--gray-1)', flexShrink: 0 }}>
          <CommandSidebar 
            commands={commands} 
            loading={loading}
            selectedCommand={selectedCommand}
            onSelect={(cmd) => {
              setSelectedCommand(cmd)
              setView('execute')
            }}
          />
        </Box>

        <Box p="4" style={{ background: 'var(--gray-2)', overflow: 'auto', flex: 1 }}>
          {view === 'execute' ? (
            <CommandExecution command={selectedCommand} />
          ) : (
            <LogViewer />
          )}
        </Box>
      </Flex>
    </Flex>
  )
}

export default Dashboard
