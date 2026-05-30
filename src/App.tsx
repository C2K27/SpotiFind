import { useEffect } from 'react'
import { AppShell } from './components/layout/AppShell'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { useRecognitionSession } from './hooks/useRecognitionSession'
import { useSpotiFindStore } from './stores/useSpotiFindStore'

function App() {
  useKeyboardShortcuts()
  useRecognitionSession()

  useEffect(() => {
    const { captureMode, systemAudioSupported } = useSpotiFindStore.getState()
    if (captureMode === 'system' && !systemAudioSupported) {
      useSpotiFindStore.setState({ captureMode: 'mic' })
    }
  }, [])

  return <AppShell />
}

export default App
