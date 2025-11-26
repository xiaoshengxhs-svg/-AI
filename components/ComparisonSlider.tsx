import React, { useState, useRef, useCallback, useEffect } from 'react';

interface ComparisonSliderProps {
  beforeImage: string;
  afterImage: string;
}

const ComparisonSlider: React.FC<ComparisonSliderProps> = ({ beforeImage, afterImage }) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback(() => {
    setIsResizing(true);
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent | React.MouseEvent) => {
      if (!isResizing || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = ('touches' in e ? (e as any).touches[0].clientX : (e as MouseEvent).clientX) - rect.left;
      const width = rect.width;
      const position = Math.max(0, Math.min(100, (x / width) * 100));

      setSliderPosition(position);
    },
    [isResizing]
  );

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsResizing(false);
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isResizing) {
        handleMouseMove(e);
      }
    };

    window.addEventListener('mouseup', handleGlobalMouseUp);
    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('touchend', handleGlobalMouseUp);
    // window.addEventListener('touchmove', handleGlobalMouseMove); // Handled in div

    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('touchend', handleGlobalMouseUp);
    };
  }, [isResizing, handleMouseMove]);

  return (
    <div 
      className="relative w-full max-w-4xl mx-auto h-[400px] md:h-[600px] overflow-hidden rounded-xl border border-slate-700 shadow-2xl select-none"
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onTouchMove={(e) => handleMouseMove(e as any)}
    >
      {/* Before Image (Background) */}
      <img
        src={beforeImage}
        alt="Original"
        className="absolute top-0 left-0 w-full h-full object-contain bg-slate-900/50"
      />
      
      {/* Label Before */}
      <div className="absolute top-4 left-4 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm z-10">
        原图
      </div>

      {/* After Image (Clipped) */}
      <div
        className="absolute top-0 left-0 w-full h-full overflow-hidden bg-slate-900/50"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <img
          src={afterImage}
          alt="Processed"
          className="absolute top-0 left-0 w-full h-full object-contain"
        />
        {/* Label After */}
        <div className="absolute top-4 right-4 bg-brand-600/80 text-white text-xs px-2 py-1 rounded backdrop-blur-sm z-10">
          去水印后
        </div>
      </div>

      {/* Slider Handle */}
      <div
        className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize z-20 shadow-[0_0_10px_rgba(0,0,0,0.5)]"
        style={{ left: `${sliderPosition}%` }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg transform active:scale-110 transition-transform">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-slate-800"
          >
            <path d="m9 18 6-6-6-6" />
            <path d="m15 18 6-6-6-6" opacity="0" /> 
            {/* Using a simple left-right arrow icon logic */}
            <path d="M16 12h-8" />
            <path d="m8 18-6-6 6-6" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default ComparisonSlider;