import React, { useState, useEffect } from 'react'
import { Box, Flex, ScrollArea, Heading, Text, Badge, Card, IconButton, Tooltip, Avatar, DropdownMenu, Button, SegmentedControl, TextField, Table } from '@radix-ui/themes'
import { MagnifyingGlassIcon, PlayIcon, ListBulletIcon, CounterClockwiseClockIcon, ExitIcon, ChevronRightIcon, ExternalLinkIcon, CubeIcon } from '@radix-ui/react-icons'
import api from '../api'
import CommandSidebar from '../components/CommandSidebar'
import CommandExecution from '../components/CommandExecution'
import LogViewer from '../components/LogViewer'

function Dashboard({ user }) {
  const [commands, setCommands] = useState([])
  const [selectedCommand, setSelectedCommand] = useState(null)
  const [view, setView] = useState('execute') // 'execute' or 'logs'
  const [loading, setLoading] = useState(true)

  const fetchCommands = async () => {
    try {
      const response = await api.get('/commands')
      setCommands(response.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCommands()
  }, [])

  const handleLogout = async () => {
    await api.post('/logout')
    window.location.reload()
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
                <Avatar size="2" fallback={user.name[0]} radius="full" color="indigo" />
                <Text size="2" weight="medium">{user.name}</Text>
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
