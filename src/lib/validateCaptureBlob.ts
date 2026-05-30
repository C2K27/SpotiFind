import type { CaptureSource } from '../types/track'

const MIC_MIN_BYTES = 700
const SYSTEM_MIN_BYTES = 1400

export interface BlobValidation {
  ok: boolean
  reason?: 'empty' | 'too_small' | 'missing_type'
}

export function getMinCaptureBytes(mode: CaptureSource): number {
  return mode === 'mic' ? MIC_MIN_BYTES : SYSTEM_MIN_BYTES
}

export function validateCaptureBlob(
  blob: Blob,
  mode: CaptureSource,
): BlobValidation {
  const minBytes = getMinCaptureBytes(mode)

  if (!blob || blob.size === 0) {
    return { ok: false, reason: 'empty' }
  }

  if (blob.size < minBytes) {
    return { ok: false, reason: 'too_small' }
  }

  if (!blob.type) {
    return { ok: false, reason: 'missing_type' }
  }

  return { ok: true }
}

export const MIN_CAPTURE_SIZE = MIC_MIN_BYTES
