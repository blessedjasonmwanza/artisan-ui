import React, { useState, useEffect } from 'react'
import { Box, Table, Card, Text, Heading, Badge, Flex, IconButton, ScrollArea, Dialog, Button } from '@radix-ui/themes'
import { EyeOpenIcon, UpdateIcon } from '@radix-ui/react-icons'
import { format } from 'date-fns'
import api from '../api'
import { toArray } from '../utils/dataValidation'

function LogViewer() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedLog, setSelectedLog] = useState(null)
  const [error, setError] = useState(null)

  const fetchLogs = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get('/logs')
      // Handle both paginated and non-paginated responses gracefully
      const data = response?.data?.data || response?.data
      const logsArray = toArray(data)
      
      // Validate log objects
      const validLogs = logsArray.filter(log => log && typeof log === 'object')
      setLogs(validLogs)
      
      if (validLogs.length === 0 && logsArray.length > 0) {
        console.warn('[LogViewer] Some logs failed validation')
      }
    } catch (err) {
      console.error('[LogViewer] Failed to fetch logs:', err)
      setError(err?.response?.data?.message || 'Failed to load logs')
      setLogs([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [])

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'green'
      case 'failed': return 'red'
      case 'running': return 'blue'
      default: return 'gray'
    }
  }

  return (
    <Box>
      <Flex justify="between" align="center" mb="5">
        <Box>
          <Heading size="7" mb="1">Execution Logs</Heading>
          <Text color="gray">History of all artisan commands executed via the UI</Text>
        </Box>
        <Button variant="soft" onClick={fetchLogs} loading={loading}>
          <UpdateIcon /> Refresh
        </Button>
      </Flex>

      {error && (
        <Card variant="surface" mb="4" style={{ borderColor: 'var(--red-5)', background: 'var(--red-2)' }}>
          <Text size="2" color="red" weight="medium">{error}</Text>
        </Card>
      )}

      <Card variant="surface">
        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>Command</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Started At</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Duration</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell align="right">Actions</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {logs.length === 0 ? (
              <Table.Row>
                <Table.Cell colSpan={5}>
                  <Flex direction="column" align="center" justify="center" p="4">
                    <Text color="gray" size="2">No logs found. Run a command to see logs here.</Text>
                  </Flex>
                </Table.Cell>
              </Table.Row>
            ) : (
              toArray(logs).map(log => (
                <Table.Row key={log?.id || Math.random()}>
                  <Table.RowHeaderCell>
                    <Text size="2" weight="bold">{log?.command || 'Unknown'}</Text>
                  </Table.RowHeaderCell>
                  <Table.Cell>
                    <Badge color={getStatusColor(log?.status)}>
                      {log?.status?.toUpperCase?.() || 'UNKNOWN'}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <Text size="2">
                      {log?.started_at ? format(new Date(log.started_at), 'MMM d, HH:mm:ss') : '-'}
                    </Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Text size="2">
                      {log?.finished_at && log?.started_at
                        ? `${Math.round((new Date(log.finished_at) - new Date(log.started_at)) / 1000)}s`
                        : '-'}
                    </Text>
                  </Table.Cell>
                  <Table.Cell align="right">
                    <Dialog.Root>
                      <Dialog.Trigger>
                        <IconButton variant="ghost" onClick={() => setSelectedLog(log)}>
                          <EyeOpenIcon />
                        </IconButton>
                      </Dialog.Trigger>
                      <Dialog.Content style={{ maxWidth: 800 }}>
                        <Dialog.Title>Log Details: {log?.command || 'Unknown'}</Dialog.Title>
                        <Dialog.Description size="2" mb="4">
                          Status: {log?.status || 'unknown'} | Started: {log?.started_at || 'unknown'}
                        </Dialog.Description>
                        
                        <Box mb="4">
                          <Text size="2" weight="bold" as="div" mb="1">Parameters:</Text>
                          <pre style={{ background: 'var(--gray-3)', padding: '8px', borderRadius: '4px', fontSize: '12px' }}>
                            {JSON.stringify(log?.parameters || {}, null, 2)}
                          </pre>
                        </Box>

                        <Box>
                          <Text size="2" weight="bold" as="div" mb="1">Output:</Text>
                          <ScrollArea style={{ height: 400, background: '#000', color: '#fff', padding: '12px', borderRadius: '4px' }}>
                            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: '12px', fontFamily: 'monospace' }}>
                              {log?.output || 'No output recorded'}
                            </pre>
                          </ScrollArea>
                        </Box>

                        <Flex gap="3" mt="4" justify="end">
                          <Dialog.Close>
                            <Button variant="soft" color="gray">Close</Button>
                          </Dialog.Close>
                        </Flex>
                      </Dialog.Content>
                    </Dialog.Root>
                  </Table.Cell>
                </Table.Row>
              ))
            )}
          </Table.Body>
        </Table.Root>
      </Card>
    </Box>
  )
}

export default LogViewer
