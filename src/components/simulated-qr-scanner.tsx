import { useEffect } from "react";

interface SimulatedQRScannerProps {
  onScan: (code: string) => void;
  onError: (error: string) => void;
  isActive: boolean;
}

// DEMO: stands in for the real app's NativeQRScanner, which drives
// navigator.mediaDevices.getUserMedia() + a live jsQR decode loop against
// the camera feed. This demo never requests camera access, so instead of a
// real scan it "detects" the next code in a fixed, rotating sequence after
// a short delay - matching the same valid / already-checked-in / cancelled
// / unknown-code states the real page renders, deterministically and
// locally. `demoScanIndex` is module-level (not component state) so the
// rotation keeps advancing across scans even though this component
// unmounts each time isActive goes back to false.
const DEMO_SCAN_SEQUENCE = ["FE-3000", "FE-3000", "FE-3005", "FE-0000"];
let demoScanIndex = 0;

export function SimulatedQRScanner({ onScan, isActive }: SimulatedQRScannerProps) {
  useEffect(() => {
    if (!isActive) return;

    // Advance the rotation inside the timeout callback, not here in the
    // effect body: StrictMode double-invokes effects in dev (mount ->
    // cleanup -> mount), which would otherwise burn two sequence slots per
    // actual scan since this line runs both times.
    const timeout = setTimeout(() => {
      const code = DEMO_SCAN_SEQUENCE[demoScanIndex % DEMO_SCAN_SEQUENCE.length];
      demoScanIndex++;
      onScan(code);
    }, 1200);
    return () => clearTimeout(timeout);
  }, [isActive, onScan]);

  if (!isActive) {
    return null;
  }

  return (
    <div className="relative w-full aspect-square bg-black overflow-hidden rounded-lg">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-800 to-slate-950 animate-pulse" />
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
