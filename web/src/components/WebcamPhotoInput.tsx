import { useEffect, useRef, useState, type ChangeEvent } from 'react'

interface WebcamPhotoInputProps {
  value: File | null
  onChange: (file: File | null) => void
}

export function WebcamPhotoInput({ value, onChange }: WebcamPhotoInputProps) {
  const [mode, setMode] = useState<'upload' | 'webcam'>('upload')
  const [streaming, setStreaming] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  function stopStream() {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    setStreaming(false)
  }

  async function startWebcam() {
    setCameraError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setStreaming(true)
    } catch {
      setCameraError("Impossible d'accéder à la caméra. Vérifiez les autorisations de votre navigateur.")
      setStreaming(false)
    }
  }

  function switchMode(next: 'upload' | 'webcam') {
    stopStream()
    setCameraError(null)
    setMode(next)
    if (next === 'webcam') {
      startWebcam()
    }
  }

  function capturePhoto() {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height)

    canvas.toBlob(
      (blob) => {
        if (!blob) return
        onChange(new File([blob], 'photo-profil.jpg', { type: 'image/jpeg' }))
        stopStream()
      },
      'image/jpeg',
      0.9,
    )
  }

  function retake() {
    onChange(null)
    startWebcam()
  }

  function handleFileInput(e: ChangeEvent<HTMLInputElement>) {
    onChange(e.target.files?.[0] ?? null)
  }

  useEffect(() => stopStream, [])

  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  useEffect(() => {
    if (!value) {
      setPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(value)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [value])

  return (
    <div className="webcam-photo-input">
      <div className="webcam-photo-tabs">
        <button
          type="button"
          className={mode === 'upload' ? 'active' : ''}
          onClick={() => switchMode('upload')}
        >
          Choisir un fichier
        </button>
        <button
          type="button"
          className={mode === 'webcam' ? 'active' : ''}
          onClick={() => switchMode('webcam')}
        >
          Prendre une photo
        </button>
      </div>

      {mode === 'upload' && (
        <input type="file" accept="image/*" required={!value} onChange={handleFileInput} />
      )}

      {mode === 'webcam' && (
        <div className="webcam-photo-capture">
          {cameraError && <p className="form-error">{cameraError}</p>}

          {!value && (
            <>
              <video ref={videoRef} className="webcam-photo-video" muted playsInline />
              {streaming && (
                <button type="button" className="btn-secondary" onClick={capturePhoto}>
                  Capturer
                </button>
              )}
            </>
          )}

          {value && (
            <div className="webcam-photo-result">
              <img src={previewUrl ?? undefined} alt="Photo capturée" />
              <button type="button" className="btn-secondary" onClick={retake}>
                Reprendre la photo
              </button>
            </div>
          )}
        </div>
      )}

      {mode === 'upload' && value && (
        <img src={previewUrl ?? undefined} alt="Photo de profil" className="webcam-photo-preview" />
      )}

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  )
}
