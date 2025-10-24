import React, { useRef, useState, useEffect } from 'react';

interface RealisticPageCurlProps {
  children: React.ReactNode;
  onNext: () => void;
  onPrev: () => void;
  theme: 'morning' | 'evening' | 'midnight';
}

const RealisticPageCurl: React.FC<RealisticPageCurlProps> = ({
  children,
  onNext,
  onPrev,
  theme
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragCurrent, setDragCurrent] = useState({ x: 0, y: 0 });
  const [corner, setCorner] = useState<'top-right' | 'bottom-right' | 'top-left' | 'bottom-left' | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const getThemeColors = () => {
    switch (theme) {
      case 'morning':
        return { bg: '#FFFFFF', shadow: 'rgba(0,0,0,0.3)', pageBg: '#FAFAFA' };
      case 'evening':
        return { bg: '#F5E6D3', shadow: 'rgba(139,69,19,0.3)', pageBg: '#F0E0C8' };
      case 'midnight':
        return { bg: '#1A1A1A', shadow: 'rgba(0,0,0,0.5)', pageBg: '#2A2A2A' };
    }
  };

  const colors = getThemeColors();

  // Draw realistic curl shadow on canvas
  const drawCurlShadow = (ctx: CanvasRenderingContext2D, width: number, height: number, progress: number, cornerType: string) => {
    ctx.clearRect(0, 0, width, height);

    // Calculate curl center and radius
    const curlX = cornerType.includes('right') ? width - (progress * width) : progress * width;
    const curlY = cornerType.includes('top') ? progress * height : height - (progress * height);
    const radius = Math.sqrt(width * width + height * height) * progress;

    // Draw gradient shadow for the curl
    const gradient = ctx.createRadialGradient(curlX, curlY, 0, curlX, curlY, radius);
    gradient.addColorStop(0, colors.shadow);
    gradient.addColorStop(0.3, `${colors.shadow.replace('0.3', '0.2').replace('0.5', '0.3')}`);
    gradient.addColorStop(1, 'rgba(0,0,0,0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Draw crease shadow along the curl line
    ctx.save();
    ctx.beginPath();
    
    if (cornerType.includes('right')) {
      ctx.moveTo(curlX, 0);
      ctx.lineTo(curlX, height);
    } else {
      ctx.moveTo(curlX, 0);
      ctx.lineTo(curlX, height);
    }

    const lineGradient = ctx.createLinearGradient(
      curlX - 20, 0,
      curlX + 20, 0
    );
    lineGradient.addColorStop(0, 'rgba(0,0,0,0)');
    lineGradient.addColorStop(0.5, colors.shadow);
    lineGradient.addColorStop(1, 'rgba(0,0,0,0)');

    ctx.strokeStyle = lineGradient;
    ctx.lineWidth = 40;
    ctx.stroke();
    ctx.restore();
  };

  // Render curl shadow
  useEffect(() => {
    if (!isDragging || !canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = containerRef.current.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    const progress = Math.abs(dragCurrent.x - dragStart.x) / rect.width;

    const animate = () => {
      if (corner) {
        drawCurlShadow(ctx, canvas.width, canvas.height, progress, corner);
      }
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isDragging, dragCurrent, corner, colors]);

  const handleStart = (clientX: number, clientY: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const cornerZone = 150;

    let detectedCorner: typeof corner = null;

    if (x > rect.width - cornerZone && y < cornerZone) {
      detectedCorner = 'top-right';
    } else if (x > rect.width - cornerZone && y > rect.height - cornerZone) {
      detectedCorner = 'bottom-right';
    } else if (x < cornerZone && y < cornerZone) {
      detectedCorner = 'top-left';
    } else if (x < cornerZone && y > rect.height - cornerZone) {
      detectedCorner = 'bottom-left';
    }

    if (detectedCorner) {
      setCorner(detectedCorner);
      setDragStart({ x, y });
      setDragCurrent({ x, y });
      setIsDragging(true);
    }
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging || !corner) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    setDragCurrent({ x, y });
  };

  const handleEnd = () => {
    if (!isDragging || !corner) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const dragDistance = Math.abs(dragCurrent.x - dragStart.x);
    const threshold = rect.width * 0.3;

    if (dragDistance > threshold) {
      // Complete flip
      if (corner.includes('right')) {
        onNext();
      } else {
        onPrev();
      }
    }

    setIsDragging(false);
    setCorner(null);
  };

  // Calculate dynamic transform for the page
  const getPageTransform = () => {
    if (!isDragging || !corner || !containerRef.current) return {};

    const rect = containerRef.current.getBoundingClientRect();
    const deltaX = dragCurrent.x - dragStart.x;
    const deltaY = dragCurrent.y - dragStart.y;
    const progress = Math.min(Math.abs(deltaX) / rect.width, 1);

    const isRightCorner = corner.includes('right');
    const direction = isRightCorner ? -1 : 1;

    // Calculate curl angle and position
    const rotateY = progress * 180 * direction;
    const translateX = deltaX * 0.5;
    const translateZ = Math.sin(progress * Math.PI) * 100;
    const skewY = progress * 5 * direction;

    return {
      transform: `
        perspective(2000px)
        translateX(${translateX}px)
        translateZ(${translateZ}px)
        rotateY(${rotateY}deg)
        skewY(${skewY}deg)
      `,
      transformOrigin: isRightCorner ? 'left center' : 'right center',
      transition: 'none',
      boxShadow: `${isRightCorner ? '-' : ''}${progress * 30}px 0 ${progress * 50}px ${colors.shadow}`,
    };
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden"
      style={{
        backgroundColor: colors.bg,
        touchAction: 'none',
        perspective: '2000px',
        perspectiveOrigin: '50% 50%'
      }}
      onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
      onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchStart={(e) => {
        e.preventDefault();
        const touch = e.touches[0];
        handleStart(touch.clientX, touch.clientY);
      }}
      onTouchMove={(e) => {
        e.preventDefault();
        const touch = e.touches[0];
        handleMove(touch.clientX, touch.clientY);
      }}
      onTouchEnd={(e) => {
        e.preventDefault();
        handleEnd();
      }}
    >
      {/* Shadow canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: isDragging ? 1 : 0,
          transition: 'opacity 0.2s',
          zIndex: 10
        }}
      />

      {/* Page content with curl effect */}
      <div
        className="absolute inset-0"
        style={{
          ...getPageTransform(),
          backfaceVisibility: 'hidden',
          willChange: 'transform',
          transformStyle: 'preserve-3d',
          backgroundColor: colors.pageBg,
        }}
      >
        {/* Back side of page (visible during curl) */}
        {isDragging && (
          <div
            className="absolute inset-0"
            style={{
              transform: 'rotateY(180deg)',
              backfaceVisibility: 'hidden',
              backgroundColor: colors.pageBg,
              opacity: 0.7,
              filter: 'brightness(0.8)',
            }}
          >
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
              {/* Reverse side - could show next/prev page preview */}
            </div>
          </div>
        )}

        {/* Front side of page */}
        <div
          className="absolute inset-0"
          style={{
            backfaceVisibility: 'hidden',
          }}
        >
          {children}
        </div>
      </div>

      {/* Corner grab indicators */}
      {!isDragging && (
        <>
          {['top-right', 'bottom-right', 'top-left', 'bottom-left'].map((cornerPos) => (
            <div
              key={cornerPos}
              className={`absolute w-32 h-32 opacity-0 hover:opacity-10 transition-opacity cursor-grab`}
              style={{
                [cornerPos.includes('top') ? 'top' : 'bottom']: 0,
                [cornerPos.includes('right') ? 'right' : 'left']: 0,
                background: `radial-gradient(circle at ${cornerPos.replace('-', ' ')}, rgba(128,128,128,0.3), transparent 70%)`,
                pointerEvents: 'none'
              }}
            />
          ))}
        </>
      )}

      {/* Spine shadow for book-like appearance */}
      <div
        className="absolute inset-y-0 left-1/2 w-1 pointer-events-none"
        style={{
          background: 'linear-gradient(to right, transparent, rgba(0,0,0,0.1), transparent)',
          transform: 'translateX(-50%)',
          opacity: 0.5
        }}
      />
    </div>
  );
};

export default RealisticPageCurl;


