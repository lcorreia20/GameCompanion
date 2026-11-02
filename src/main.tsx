import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { localSettingsRepository } from './repositories/local'
import './styles.css'
import './extra.css'
import './accessibility.css'
import './theme.css'

document.documentElement.dataset.theme = localSettingsRepository.getTheme()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><App /></React.StrictMode>,
)
