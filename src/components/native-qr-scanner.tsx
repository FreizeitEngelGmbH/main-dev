import { useEffect, useRef } from "react";
import jsQR from "jsqr";

interface NativeQRScannerProps {
  onScan: (code: string) => void;
  onError: (error: string) => void;
  isActive: boolean;
}

declare global {
  interface Window {
    BarcodeDetector?: new (options?: { formats: string[] }) => {
      detect: (source: ImageBitmapSource) => Promise<Array<{ rawValue: string }>>;
    };
  }
}

export function NativeQRScanner({ onScan, onError, isActive }: NativeQRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number>(0);
  const isRunningRef = useRef(false);

  useEffect(() => {
    if (!isActive) {
      cleanup();
      return;
    }

    let mounted = true;

    async function startCamera() {
      if (!mounted) return;

      // Browsers only expose the camera API on HTTPS or localhost; on plain
      // http (e.g. a LAN IP) navigator.mediaDevices is undefined.
      if (!navigator.mediaDevices?.getUserMedia) {
        onError("Kamera nicht verfügbar. Der Scanner benötigt eine sichere Verbindung (HTTPS).");
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: "environment",
            width: { ideal: 640 },
            height: { ideal: 480 }
          }
        });
        
        if (!mounted) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }
        
        streamRef.current = stream;
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          try {
            await videoRef.current.play();
            isRunningRef.current = true;
            scanLoop();
          } catch (playErr: any) {
            if (playErr.message?.includes("interrupted")) {
              return;
            }
            throw playErr;
          }
        }
      } catch (err: any) {
        if (!mounted) return;
        console.error("Camera error:", err);
        if (err.name === "NotAllowedError") {
          onError("Kamera-Zugriff verweigert. Bitte erlaube den Kamerazugriff.");
        } else if (err.name === "NotFoundError") {
          onError("Keine Kamera gefunden.");
        } else if (!err.message?.includes("interrupted")) {
          onError("Kamera-Fehler: " + err.message);
        }
      }
    }

    function scanLoop() {
      if (!isRunningRef.current || !mounted) return;
      
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState !== 4) {
        animationRef.current = requestAnimationFrame(scanLoop);
        return;
      }

      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) {
        animationRef.current = requestAnimationFrame(scanLoop);
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);

      try {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const qrCode = jsQR(imageData.data, imageData.width, imageData.height);
        if (qrCode && qrCode.data) {
          isRunningRef.current = false;
          cleanup();
          onScan(qrCode.data);
          return;
        }
      } catch (err) {
        // Continue scanning
      }

      if (isRunningRef.current && mounted) {
        animationRef.current = requestAnimationFrame(scanLoop);
      }
    }

    function cleanup() {
      isRunningRef.current = false;
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = 0;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    }

    startCamera();

    return () => {
      mounted = false;
      cleanup();
    };
  }, [isActive, onScan, onError]);

  if (!isActive) {
    return null;
  }

  return (
    <div className="relative w-full aspect-square bg-black overflow-hidden rounded-lg">
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        playsInline
        muted
      />
      <canvas ref={canvasRef} className="hidden" />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="relative w-48 h-48">
          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-400 rounded-tl-lg" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-400 rounded-tr-lg" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-400 rounded-bl-lg" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-400 rounded-br-lg" />
        </div>
      </div>
      <div className="absolute bottom-4 left-0 right-0 text-center">
        <span className="bg-black/70 text-white px-4 py-2 rounded-full text-sm font-medium">
          QR-Code in den Rahmen halten
        </span>
      </div>
    </div>
  );
}
