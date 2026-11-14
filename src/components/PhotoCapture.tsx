"use client";

import { useEffect, useRef, useState } from "react";
import { btnGhost, btnPrimary, btnSecondary } from "@/components/ui";

type Props = {
  onPhoto: (photo: HTMLCanvasElement) => void;
  onSkip: () => void;
};

const TIMER_SECONDS = 5;

/**
 * Self-timer camera: the parent props the phone up, presses start and runs into the shot,
 * so the whole family is in the picture. The photo never leaves the device.
 */
export default function PhotoCapture({ onPhoto, onSkip }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [flash, setFlash] = useState(false);
  const [videoReady, setVideoReady] = useState(false);

  useEffect(
    () => () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (timerRef.current) clearInterval(timerRef.current);
    },
    [],
  );

  // Attach the stream only after the <video> element is on screen.
  // (Attaching it earlier is what left the preview black on iPhone.)
  useEffect(() => {
    const video = videoRef.current;
    const stream = streamRef.current;
    if (!cameraOn || !video || !stream) return;
    const onReady = () => setVideoReady(video.videoWidth > 0);
    video.addEventListener("loadedmetadata", onReady);
    video.addEventListener("playing", onReady);
    video.srcObject = stream;
    video.play().catch(() => {
      // Some in-app browsers block autoplay; the camera-app fallback below still works.
    });
    return () => {
      video.removeEventListener("loadedmetadata", onReady);
      video.removeEventListener("playing", onReady);
    };
  }, [cameraOn]);

  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraOn(false);
    setVideoReady(false);
  }

  async function startCamera() {
    setCameraError(false);
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError(true);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });
      streamRef.current = stream;
      setCameraOn(true);
    } catch {
      setCameraError(true);
    }
  }

  function capture() {
    const video = videoRef.current;
    if (!video || !video.videoWidth) {
      // The browser gave us a camera but no picture: fall back to the camera app.
      stopCamera();
      setCameraError(true);
      return;
    }
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    // Mirror the shot so it matches the selfie preview the family just saw.
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setFlash(true);
    setTimeout(() => onPhoto(canvas), 250);
  }

  function startTimer() {
    let n = TIMER_SECONDS;
    setCountdown(n);
    timerRef.current = setInterval(() => {
      n -= 1;
      if (n <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        setCountdown(null);
        capture();
      } else {
        setCountdown(n);
      }
    }, 1000);
  }

  function fromFile(file: File | undefined) {
    if (!file) return;
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      canvas.getContext("2d")?.drawImage(img, 0, 0);
      URL.revokeObjectURL(img.src);
      onPhoto(canvas);
    };
    img.src = URL.createObjectURL(file);
  }

  return (
    <div>
      {cameraOn ? (
        <div className="relative overflow-hidden rounded-3xl border-2 border-ink bg-ink">
          <video ref={videoRef} autoPlay playsInline muted className="aspect-[3/4] w-full -scale-x-100 object-cover" />
          {countdown !== null && (
            <div className="absolute inset-0 grid place-items-center bg-ink/20">
              <span key={countdown} className="font-display animate-pop text-[9rem] font-bold text-white drop-shadow-lg">
                {countdown}
              </span>
            </div>
          )}
          {flash && <div className="absolute inset-0 bg-white" />}
        </div>
      ) : (
        <div className="grid aspect-[3/4] place-items-center rounded-3xl border-2 border-dashed border-ink/40 bg-white p-6 text-center">
          <div>
            <p className="text-6xl">📸</p>
            <p className="mt-3 font-extrabold">Prop the phone up, press the timer, squeeze in together.</p>
            {cameraError && (
              <p className="mt-2 text-sm text-coral-dark">
                We couldn&apos;t open the camera. You can take the photo with your camera app instead.
              </p>
            )}
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-col gap-3">
        {!cameraOn && (
          <button type="button" onClick={startCamera} className={btnPrimary}>
            Open camera
          </button>
        )}
        {cameraOn && countdown === null && (
          <button type="button" onClick={startTimer} disabled={!videoReady} className={btnPrimary}>
            {videoReady ? `Start ${TIMER_SECONDS}-second timer` : "Starting camera…"}
          </button>
        )}
        <label className={`${btnSecondary} cursor-pointer`}>
          Use the camera app instead
          <input
            type="file"
            accept="image/*"
            capture="user"
            className="sr-only"
            onChange={(e) => fromFile(e.target.files?.[0])}
          />
        </label>
        <button type="button" onClick={onSkip} className={btnGhost}>
          Skip the photo
        </button>
      </div>
    </div>
  );
}
