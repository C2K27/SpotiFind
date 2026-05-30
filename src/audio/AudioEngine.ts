import type { CaptureSource } from '../types/track'
import { debugLog } from '../lib/debugLog'
import { withTimeout } from '../lib/withTimeout'
import { supportsDeviceAudioCapture } from './captureSupport'
import { requestDeviceAudioStream } from './displayCapture'
import { fileNameForMime, pickRecorderMimeType } from './mimeSupport'
import {
  activityThresholdFor,
  minRecordedBytesFor,
  peakThresholdFor,
} from './signalMetrics'

const BAR_COUNT = 48
const STOP_RECORDING_MS = 6000

export { supportsDeviceAudioCapture, supportsSystemAudioCapture } from './captureSupport'

export class AudioEngine {
  private context: AudioContext | null = null
  private stream: MediaStream | null = null
  private displayStream: MediaStream | null = null
  private analyser: AnalyserNode | null = null
  private source: MediaStreamAudioSourceNode | null = null
  private recorder: MediaRecorder | null = null
  private chunks: Blob[] = []
  private recordedMimeType = 'audio/webm'
  private recordedExtension = 'webm'
  private totalChunkBytes = 0
  private peakLevel = 0
  private activityFrames = 0
  private captureMode: CaptureSource = 'mic'
  private frequencyBuffer: Uint8Array | null = null
  private timeBuffer: Uint8Array | null = null
  private running = false
  private onStreamEndedHandler: (() => void) | null = null

  get isRunning(): boolean {
    return this.running
  }

  getCaptureMode(): CaptureSource {
    return this.captureMode
  }

  onStreamEnded(handler: (() => void) | null): void {
    this.onStreamEndedHandler = handler
  }

  private bindStreamLifecycle(stream: MediaStream): void {
    const handleEnded = () => {
      this.onStreamEndedHandler?.()
    }

    stream.getAudioTracks().forEach((track) => {
      track.addEventListener('ended', handleEnded)
    })
  }

  async start(mode: CaptureSource): Promise<void> {
    await this.dispose()

    this.captureMode = mode
    this.peakLevel = 0
    this.activityFrames = 0

    const { stream, displayStream } = await this.acquireStream(mode)
    this.stream = stream
    this.displayStream = displayStream
    this.bindStreamLifecycle(stream)

    const mime = pickRecorderMimeType()
    this.recordedMimeType = mime.mimeType
    this.recordedExtension = mime.extension

    debugLog('capture started', { mode, mimeType: mime.mimeType })

    const context = new AudioContext()
    this.context = context

    if (context.state === 'suspended') {
      await context.resume()
    }

    const source = context.createMediaStreamSource(stream)
    const analyser = context.createAnalyser()
    analyser.fftSize = 512
    analyser.smoothingTimeConstant = 0.65
    source.connect(analyser)

    this.source = source
    this.analyser = analyser
    this.frequencyBuffer = new Uint8Array(analyser.frequencyBinCount)
    this.timeBuffer = new Uint8Array(analyser.fftSize)

    this.chunks = []
    this.totalChunkBytes = 0

    this.recorder = MediaRecorder.isTypeSupported(mime.mimeType)
      ? new MediaRecorder(stream, {
          mimeType: mime.mimeType,
          audioBitsPerSecond: 128_000,
        })
      : new MediaRecorder(stream)

    this.recorder.ondataavailable = (event) => {
      if (event.data.size <= 0) return
      this.chunks.push(event.data)
      this.totalChunkBytes += event.data.size
    }

    this.recorder.onerror = () => {
      debugLog('MediaRecorder error')
    }

    this.recorder.start(250)
    this.running = true
  }

  private async acquireStream(
    mode: CaptureSource,
  ): Promise<{ stream: MediaStream; displayStream: MediaStream | null }> {
    if (mode === 'system') {
      if (!supportsDeviceAudioCapture()) {
        throw new Error('SYSTEM_AUDIO_UNSUPPORTED')
      }

      const stream = await requestDeviceAudioStream()
      return { stream, displayStream: null }
    }

    const micStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: true,
      },
      video: false,
    })

    return { stream: micStream, displayStream: null }
  }

  isStreamActive(): boolean {
    if (!this.stream) return false
    return this.stream.getAudioTracks().some((t) => t.readyState === 'live')
  }

  sampleSignal(): number {
    const level = this.getLevel()
    this.peakLevel = Math.max(this.peakLevel, level)

    const threshold = activityThresholdFor(this.captureMode)
    if (level > threshold) {
      this.activityFrames += 1
    }

    return level
  }

  getLevel(): number {
    if (!this.analyser || !this.timeBuffer) return 0

    this.analyser.getByteTimeDomainData(this.timeBuffer)
    let sum = 0
    for (let i = 0; i < this.timeBuffer.length; i++) {
      const v = (this.timeBuffer[i]! - 128) / 128
      sum += v * v
    }
    const rms = Math.sqrt(sum / this.timeBuffer.length)
    return Math.min(1, rms * 4.2)
  }

  hasAudibleActivity(): boolean {
    return this.sampleSignal() > activityThresholdFor(this.captureMode)
  }

  hasRecordedData(): boolean {
    return this.totalChunkBytes >= minRecordedBytesFor(this.captureMode)
  }

  hasMeaningfulSignal(): boolean {
    const peakMin = peakThresholdFor(this.captureMode)
    const bytesMin = minRecordedBytesFor(this.captureMode)

    return (
      this.peakLevel >= peakMin ||
      this.totalChunkBytes >= bytesMin ||
      this.activityFrames >= 4
    )
  }

  getFrequencyBars(count = BAR_COUNT): number[] {
    if (!this.analyser || !this.frequencyBuffer) {
      return Array.from({ length: count }, () => 0.1)
    }

    this.analyser.getByteFrequencyData(this.frequencyBuffer)
    const bars: number[] = []
    const step = Math.max(1, Math.floor(this.frequencyBuffer.length / count))

    for (let i = 0; i < count; i++) {
      const start = i * step
      let sum = 0
      for (let j = 0; j < step; j++) {
        sum += this.frequencyBuffer[start + j] ?? 0
      }
      const avg = sum / step / 255
      bars.push(0.1 + avg * 0.9)
    }

    return bars
  }

  getRecordedFileName(): string {
    return fileNameForMime(this.recordedMimeType, this.recordedExtension)
  }

  async stopRecording(): Promise<Blob> {
    const mimeType =
      this.recorder?.mimeType || this.recordedMimeType || 'audio/webm'

    const buildBlob = () => new Blob(this.chunks, { type: mimeType })

    if (!this.recorder || this.recorder.state === 'inactive') {
      return buildBlob()
    }

    const stopPromise = new Promise<Blob>((resolve, reject) => {
      const recorder = this.recorder!

      recorder.onstop = () => resolve(buildBlob())
      recorder.onerror = () => reject(new Error('RECORDING_FAILED'))

      try {
        if (recorder.state === 'recording') {
          recorder.requestData()
        }
        recorder.stop()
      } catch (error) {
        reject(error instanceof Error ? error : new Error('RECORDING_FAILED'))
      }
    })

    try {
      const blob = await withTimeout(
        stopPromise,
        STOP_RECORDING_MS,
        'RECORDING_STOP_TIMEOUT',
      )
      debugLog('stopRecording', { bytes: blob.size, mode: this.captureMode })
      return blob
    } catch {
      return buildBlob()
    }
  }

  async dispose(): Promise<void> {
    this.running = false
    this.onStreamEndedHandler = null

    if (this.recorder && this.recorder.state !== 'inactive') {
      try {
        if (this.recorder.state === 'recording') {
          this.recorder.requestData()
        }
        this.recorder.stop()
      } catch {
        /* ignore */
      }
    }
    this.recorder = null
    this.chunks = []
    this.totalChunkBytes = 0
    this.peakLevel = 0
    this.activityFrames = 0

    this.source?.disconnect()
    this.source = null
    this.analyser = null
    this.frequencyBuffer = null
    this.timeBuffer = null

    this.stream?.getTracks().forEach((t) => t.stop())
    this.stream = null

    this.displayStream?.getTracks().forEach((t) => t.stop())
    this.displayStream = null

    if (this.context) {
      await this.context.close().catch(() => undefined)
      this.context = null
    }
  }
}

export const audioEngine = new AudioEngine()
