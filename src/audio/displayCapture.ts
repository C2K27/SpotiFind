type DeviceAudioOptions = DisplayMediaStreamOptions & {
  systemAudio?: 'include' | 'exclude'
  preferCurrentTab?: boolean
}

export async function requestDeviceAudioStream(): Promise<MediaStream> {
  if (!navigator.mediaDevices?.getDisplayMedia) {
    throw new Error('SYSTEM_AUDIO_UNSUPPORTED')
  }

  const options: DeviceAudioOptions = {
    video: false,
    audio: {
      echoCancellation: false,
      noiseSuppression: false,
      autoGainControl: false,
    },
    systemAudio: 'include',
    preferCurrentTab: true,
  }

  let stream: MediaStream
  try {
    stream = await navigator.mediaDevices.getDisplayMedia(options)
  } catch (error) {
    if (error instanceof DOMException && error.name === 'NotAllowedError') {
      throw error
    }
    throw new Error('SYSTEM_AUDIO_UNSUPPORTED')
  }

  const audioTracks = stream.getAudioTracks()
  if (audioTracks.length === 0) {
    stream.getTracks().forEach((track) => track.stop())
    throw new Error('SYSTEM_AUDIO_NO_TRACK')
  }

  stream.getVideoTracks().forEach((track) => track.stop())

  return new MediaStream(audioTracks)
}
