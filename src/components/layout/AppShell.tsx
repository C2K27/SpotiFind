import { memo, useCallback, useEffect, useState } from 'react'
import { useCurrentRecognition, useSpotiFindStore } from '../../stores/useSpotiFindStore'
import { PageTransition } from '../ui/PageTransition'
import { HistoryPage } from '../history/HistoryPage'
import { RecentStrip } from '../history/RecentStrip'
import { RecognitionPanel } from '../recognition/RecognitionPanel'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import styles from './AppShell.module.css'

function AppShellComponent() {
  const page = useSpotiFindStore((s) => s.page)
  const setPage = useSpotiFindStore((s) => s.setPage)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const {
    recognitionState,
    currentTrack,
    currentEntryId,
    showSuccessPulse,
    saved,
    confidence,
    recognitionMessage,
  } = useCurrentRecognition()

  const closeDrawer = useCallback(() => setDrawerOpen(false), [])

  const handleNavigate = useCallback(
    (id: typeof page) => {
      setPage(id)
      setDrawerOpen(false)
    },
    [setPage],
  )

  useEffect(() => {
    document.title =
      page === 'history'
        ? 'History — SpotiFind'
        : 'Identify — SpotiFind'
  }, [page])

  useEffect(() => {
    if (!drawerOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setDrawerOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [drawerOpen])

  useEffect(() => {
    if (!drawerOpen) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [drawerOpen])

  useEffect(() => {
    const media = window.matchMedia('(min-width: 769px)')
    const onChange = () => {
      if (media.matches) setDrawerOpen(false)
    }
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  return (
    <div className={styles.shell}>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Sidebar
        active={page}
        onNavigate={handleNavigate}
        drawerOpen={drawerOpen}
        onCloseDrawer={closeDrawer}
      />
      <div className={styles.main}>
        <TopBar
          state={recognitionState}
          page={page}
          onOpenMenu={() => setDrawerOpen(true)}
        />
        <main id="main" className={styles.content} tabIndex={-1}>
          <PageTransition pageKey={page}>
            {page === 'identify' ? (
              <div className={styles.identifyView}>
                <div className={styles.identifyMain}>
                  <RecognitionPanel
                    state={recognitionState}
                    track={currentTrack}
                    entryId={currentEntryId}
                    saved={saved}
                    confidence={confidence}
                    showSuccessPulse={showSuccessPulse}
                    recognitionMessage={recognitionMessage}
                  />
                </div>
                <RecentStrip />
              </div>
            ) : (
              <HistoryPage />
            )}
          </PageTransition>
        </main>
      </div>
    </div>
  )
}

export const AppShell = memo(AppShellComponent)
