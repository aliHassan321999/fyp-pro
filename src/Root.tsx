import React from 'react'
import { HelmetProvider } from 'react-helmet-async'
import App from './App'


function Root() {
  return (
    <HelmetProvider>
      <App />
    </HelmetProvider>
  )
}

export default Root
