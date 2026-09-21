import { useEffect, useRef } from 'react';
import QRCodeLibrary from 'qrcode';

interface QRCodeProps {
  value: string;
  size?: number;
  className?: string;
}

export function QRCode({ value, size = 160, className }: QRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      QRCodeLibrary.toCanvas(
        canvasRef.current,
        value,
        {
          width: size,
          margin: 1,
          color: {
            dark: '#000000', // Dark squares
            light: '#FFFFFF' // Light squares
          }
        },
        (error) => {
          if (error) console.error('Error generating QR code:', error);
        }
      );
    }
  }, [value, size]);

  return (
    <canvas 
      ref={canvasRef} 
      className={className}
      width={size}
      height={size}
    />
  );
}