import { stringToHue } from '../../lib/stringToHue'
import type { Track } from '../../types/track'
import type { RecognitionMatch } from './types'
import type { CaptureSource } from '../../types/track'

interface AuddAppleMusic {
  name?: string
  artistName?: string
  albumName?: string
  durationInMillis?: number
}

interface AuddSpotify {
  name?: string
  artists?: Array<{ name?: string }>
  album?: { name?: string }
  duration_ms?: number
  explicit?: boolean
  id?: string
}

interface AuddPayload {
  title?: string
  artist?: string
  album?: string
  song_link?: string
  timecode?: string
  apple_music?: AuddAppleMusic
  spotify?: AuddSpotify
}

export function mapAuddToMatch(
  payload: AuddPayload,
  source: CaptureSource,
): RecognitionMatch | null {
  const spotify = payload.spotify
  const apple = payload.apple_music

  const title =
    spotify?.name ?? apple?.name ?? payload.title ?? null
  const artist =
    spotify?.artists?.[0]?.name ?? apple?.artistName ?? payload.artist ?? null

  if (!title || !artist) return null

  const album =
    spotify?.album?.name ?? apple?.albumName ?? payload.album ?? 'Single'
  const durationMs =
    spotify?.duration_ms ?? apple?.durationInMillis ?? 180_000

  const id =
    spotify?.id ??
    `audd_${title.replace(/\s+/g, '_').slice(0, 24)}_${Date.now()}`

  const track: Track = {
    id,
    title,
    artist,
    album,
    durationMs,
    coverHue: stringToHue(`${artist}-${title}`),
    isExplicit: spotify?.explicit,
  }

  return {
    track,
    confidence: 0.92,
    source,
  }
}
