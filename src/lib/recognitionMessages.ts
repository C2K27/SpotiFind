export const RecognitionCopy = {
  noMatch: "Couldn't identify this track",
  noMatchHint: 'Try holding closer to the audio source.',
  quietAudio: 'Try holding closer to the audio source.',
  recognitionFailed: "Couldn't identify this track",
  deviceStopped:
    'Device audio ended before a match could be found. Try microphone mode.',
  devicePermissionCancelled:
    'Audio permission was cancelled. Try microphone mode instead.',
  micRequired: 'Microphone access is needed to identify music.',
  deviceUnsupported:
    'Device audio is not available here. Microphone mode is recommended.',
  deviceNoTrack:
    'No audio source was detected. Try microphone mode instead.',
  deviceCaptureFailed:
    'Device audio could not be started. Try microphone mode instead.',
} as const
