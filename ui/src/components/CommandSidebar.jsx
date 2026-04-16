import React, { useState } from 'react'
import { Box, Flex, TextField, ScrollArea, Text, Badge, Card } from '@radix-ui/themes'
import { MagnifyingGlassIcon } from '@radix-ui/react-icons'

function CommandSidebar({ commands, loading, selectedCommand, onSelect }) {
  const [search, setSearch] = useState('')

  const filtered = commands.filter(cmd => 
    cmd.name.toLowerCase().includes(search.toLowerCase()) ||
    cmd.description.toLowerCase().includes(search.toLowerCase())
  )

  // Group by namespace
  const groups = filtered.reduce((acc, cmd) => {
    const namespace = cmd.name.includes(':') ? cmd.name.split(':')[0] : 'general'
    if (!acc[namespace]) acc[namespace] = []
    acc[namespace].push(cmd)
    return acc
  }, {})

  return (
    <Flex direction="column" style={{ height: '100%' }}>
      <Box p="3">
        <TextField.Root 
          placeholder="Search commands..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        >
          <TextField.Slot>
            <MagnifyingGlassIcon height="16" width="16" />
          </TextField.Slot>
        </TextField.Root>
      </Box>

      <ScrollArea scrollbars="vertical" style={{ flex: 1 }}>
        <Box px="3" pb="4">
          {Object.entries(groups).sort().map(([namespace, cmds]) => (
            <Box key={namespace} mb="4">
              <Text size="1" weight="bold" color="gray" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }} mb="2" as="div">
                {namespace}
              </Text>
              <Flex direction="column" gap="1">
                {cmds.map(cmd => (
                  <Box
                    key={cmd.name}
                    p="2"
                    style={{
                      cursor: 'pointer',
                      borderRadius: 'var(--radius-2)',
                      background: selectedCommand?.name === cmd.name ? 'var(--indigo-4)' : 'transparent',
                      color: selectedCommand?.name === cmd.name ? 'var(--indigo-11)' : 'var(--gray-11)',
                    }}
                    onMouseEnter={(e) => {
                      if (selectedCommand?.name !== cmd.name) e.currentTarget.style.background = 'var(--gray-3)'
                    }}
                    onMouseLeave={(e) => {
                      if (selectedCommand?.name !== cmd.name) e.currentTarget.style.background = 'transparent'
                    }}
                    onClick={() => onSelect(cmd)}
                  >
                    <Text size="2" weight={selectedCommand?.name === cmd.name ? 'bold' : 'regular'}>
                      {cmd.name.replace(namespace + ':', '') || cmd.name}
                    </Text>
                    <Text size="1" color="gray" truncate as="div">
                      {cmd.description}
                    </Text>
                  </Box>
                ))}
              </Flex>
            </Box>
          ))}
        </Box>
      </ScrollArea>
    </Flex>
  )
}

export default CommandSidebar
