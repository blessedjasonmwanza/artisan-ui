import React from 'react'
import { Box, Flex, Text, Heading, Button, Card, Callout } from '@radix-ui/themes'
import { ExclamationTriangleIcon, ReloadIcon } from '@radix-ui/react-icons'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo)
    this.setState({
      error,
      errorInfo,
    })
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  render() {
    if (this.state.hasError) {
      return (
        <Flex align="center" justify="center" direction="column" style={{ height: '100vh', padding: '40px' }}>
          <Card variant="surface" style={{ maxWidth: '600px', width: '100%' }}>
            <Flex direction="column" gap="4">
              <Flex gap="3" align="center">
                <ExclamationTriangleIcon width="32" height="32" color="red" />
                <Heading size="5" color="red">Something went wrong</Heading>
              </Flex>
              
              <Callout.Root>
                <Callout.Icon>!</Callout.Icon>
                <Callout.Text>
                  An unexpected error occurred. Please try refreshing the page or contact your administrator.
                </Callout.Text>
              </Callout.Root>

              <Box>
                <Text size="2" weight="bold" mb="2" as="div">Error Details:</Text>
                <Box 
                  p="3" 
                  style={{ 
                    background: 'var(--gray-3)', 
                    borderRadius: 'var(--radius-2)',
                    maxHeight: '200px',
                    overflow: 'auto',
                    fontFamily: 'monospace',
                    fontSize: '12px'
                  }}
                >
                  <Text size="1" color="red" as="div">
                    {this.state.error?.toString()}
                  </Text>
                  {this.state.errorInfo && (
                    <Text size="1" color="gray" as="div" mt="2" style={{ whiteSpace: 'pre-wrap' }}>
                      {this.state.errorInfo.componentStack}
                    </Text>
                  )}
                </Box>
              </Box>

              <Flex gap="3">
                <Button 
                  size="3" 
                  onClick={this.handleReset}
                  variant="solid"
                >
                  <ReloadIcon /> Try Again
                </Button>
                <Button 
                  size="3" 
                  variant="soft"
                  onClick={() => window.location.reload()}
                >
                  Refresh Page
                </Button>
              </Flex>
            </Flex>
          </Card>
        </Flex>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
