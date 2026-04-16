import React, { useState, useEffect } from 'react'
import { Box, Flex, Text, Heading, Button, Card, TextField, Switch, Badge, Callout, ScrollArea, Grid } from '@radix-ui/themes'
import { PlayIcon, InfoCircledIcon, CheckCircledIcon, CrossCircledIcon } from '@radix-ui/react-icons'
import api from '../api'

function CommandExecution({ command }) {
  const [params, setParams] = useState({})
  const [executing, setExecuting] = useState(false)
  const [log, setLog] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    setParams({})
    setLog(null)
    setError('')
  }, [command])

  const handleParamChange = (name, value) => {
    setParams(prev => ({ ...prev, [name]: value }))
  }

  const runCommand = async () => {
    setExecuting(true)
    setError('')
    setLog(null)
    try {
      const response = await api.post('/run', {
        command: command.name,
        parameters: params
      })
      
      // Start polling for this log
      pollLog(response.data.log_id)
    } catch (err) {
      setError(err.response?.data?.message || 'Execution failed')
      setExecuting(false)
    }
  }

  const pollLog = async (id) => {
    try {
      const response = await api.get(`/logs/${id}`)
      setLog(response.data)
      
      if (response.data.status === 'running') {
        setTimeout(() => pollLog(id), 1000)
      } else {
        setExecuting(false)
      }
    } catch (err) {
      setExecuting(false)
    }
  }

  if (!command) {
    return (
      <Flex direction="column" align="center" justify="center" style={{ height: '100%', opacity: 0.5 }}>
        <PlayIcon width="64" height="64" />
        <Text size="5" mt="4">Select a command to execute</Text>
      </Flex>
    )
  }

  return (
    <Box>
      <Flex justify="between" align="start" mb="5">
        <Box>
          <Heading size="7" mb="1">{command.name}</Heading>
          <Text color="gray" size="3">{command.description}</Text>
        </Box>
        <Button size="3" onClick={runCommand} loading={executing} disabled={executing}>
          <PlayIcon /> Run Command
        </Button>
      </Flex>

      <Flex gap="5">
        <Flex direction="column" gap="4" style={{ flex: 1 }}>
          {/* Arguments */}
          {command.arguments.length > 0 && (
            <Card variant="surface">
              <Heading size="3" mb="3">Arguments</Heading>
              <Flex direction="column" gap="3">
                {command.arguments.map(arg => (
                  <Box key={arg.name}>
                    <Flex justify="between" mb="1">
                      <Text size="2" weight="bold">{arg.name}</Text>
                      {arg.required && <Badge color="red" variant="soft">Required</Badge>}
                    </Flex>
                    <TextField.Root 
                      placeholder={arg.default || 'Enter value...'}
                      value={params[arg.name] || ''}
                      onChange={(e) => handleParamChange(arg.name, e.target.value)}
                    />
                    <Text size="1" color="gray" mt="1" as="div">{arg.description}</Text>
                  </Box>
                ))}
              </Flex>
            </Card>
          )}

          {/* Options */}
          {command.options.length > 0 && (
            <Card variant="surface">
              <Heading size="3" mb="3">Options</Heading>
              <Flex direction="column" gap="4">
                {command.options.map(opt => (
                  <Box key={opt.name}>
                    <Flex justify="between" align="center" mb={opt.is_flag ? "0" : "1"}>
                      <Box>
                        <Text size="2" weight="bold">--{opt.name}</Text>
                        <Text size="1" color="gray" as="div">{opt.description}</Text>
                      </Box>
                      {opt.is_flag ? (
                        <Switch 
                          checked={!!params['--' + opt.name]}
                          onCheckedChange={(val) => handleParamChange('--' + opt.name, val)}
                        />
                      ) : (
                        <TextField.Root 
                          style={{ width: 150 }}
                          placeholder={opt.default || 'Value...'}
                          value={params['--' + opt.name] || ''}
                          onChange={(e) => handleParamChange('--' + opt.name, e.target.value)}
                        />
                      )}
                    </Flex>
                  </Box>
                ))}
              </Flex>
            </Card>
          )}
        </Flex>

        {/* Output Console */}
        <Box style={{ flex: 1.5 }}>
          <Card style={{ height: '600px', display: 'flex', flexDirection: 'column', background: '#000', color: '#fff', padding: 0 }}>
            <Flex p="2" justify="between" align="center" style={{ borderBottom: '1px solid #333' }}>
              <Text size="2" weight="medium" style={{ opacity: 0.7 }}>Output Console</Text>
              {log && (
                <Badge color={log.status === 'success' ? 'green' : (log.status === 'failed' ? 'red' : 'blue')}>
                  {log.status.toUpperCase()}
                </Badge>
              )}
            </Flex>
            <ScrollArea scrollbars="vertical" style={{ flex: 1, padding: '12px' }}>
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '13px', lineHeight: '1.4' }}>
                {log?.output || (executing ? 'Executing...' : 'Waiting for execution...')}
              </pre>
            </ScrollArea>
          </Card>
          
          {error && (
            <Callout.Root color="red" mt="4">
              <Callout.Icon><InfoCircledIcon /></Callout.Icon>
              <Callout.Text>{error}</Callout.Text>
            </Callout.Root>
          )}
        </Box>
      </Flex>
    </Box>
  )
}

export default CommandExecution
