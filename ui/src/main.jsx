import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { Theme } from '@radix-ui/themes'
import '@radix-ui/themes/styles.css'
import './index.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename={window.ArtisanUI?.path || '/artisan-ui'}>
      <QueryClientProvider client={queryClient}>
        <Theme accentColor="indigo" grayColor="slate" panelBackground="translucent" radius="large" appearance="dark">
          <App />
        </Theme>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
