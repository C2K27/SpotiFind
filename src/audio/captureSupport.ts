export function supportsDeviceAudioCapture(): boolean {
  if (typeof navigator === 'undefined' || !window.isSecureContext) {
    return false
  }

  return Boolean(navigator.mediaDevices?.getDisplayMedia)
}

export const supportsSystemAudioCapture = supportsDeviceAudioCapture
