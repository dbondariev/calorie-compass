import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createTheme, CssBaseline, ThemeProvider } from '@mui/material'
import './index.css'
import App from './App.tsx'
import { ErrorBoundary } from './components/ErrorBoundary.tsx'
import { PreferencesProvider } from './preferences.tsx'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#18755f', dark: '#125545', light: '#66bda4' },
    background: { default: '#f5f7f2', paper: '#ffffff' },
    text: { primary: '#14201d', secondary: '#61706b' },
  },
  typography: { fontFamily: "'DM Sans', system-ui, sans-serif", button: { fontWeight: 700, textTransform: 'none' } },
  shape: { borderRadius: 16 },
  components: {
    MuiPaper: { styleOverrides: { root: { borderColor: '#dfe6e1' } } },
    MuiButton: { styleOverrides: { root: { borderRadius: 12, boxShadow: 'none' } } },
    MuiToggleButton: { styleOverrides: { root: { textTransform: 'none', fontWeight: 650 } } },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ErrorBoundary>
        <PreferencesProvider>
          <App />
        </PreferencesProvider>
      </ErrorBoundary>
    </ThemeProvider>
  </StrictMode>,
)
