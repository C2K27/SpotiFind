export interface RecorderMimeChoice {
  mimeType: string
  extension: string
}

const CANDIDATES: RecorderMimeChoice[] = [
  { mimeType: 'audio/webm;codecs=opus', extension: 'webm' },
  { mimeType: 'audio/webm', extension: 'webm' },
  { mimeType: 'audio/mp4', extension: 'm4a' },
  { mimeType: 'audio/ogg;codecs=opus', extension: 'ogg' },
  { mimeType: 'audio/ogg', extension: 'ogg' },
]

export function pickRecorderMimeType(): RecorderMimeChoice {
  if (typeof MediaRecorder === 'undefined') {
    return { mimeType: 'audio/webm', extension: 'webm' }
  }

  for (const candidate of CANDIDATES) {
    if (MediaRecorder.isTypeSupported(candidate.mimeType)) {
      return candidate
    }
  }

  return { mimeType: 'audio/webm', extension: 'webm' }
}

export function fileNameForMime(mimeType: string, extension: string): string {
  const type = mimeType.toLowerCase()
  if (type.includes('mp4')) return 'capture.m4a'
  if (type.includes('ogg')) return 'capture.ogg'
  if (type.includes('wav')) return 'capture.wav'
  return `capture.${extension}`
}
