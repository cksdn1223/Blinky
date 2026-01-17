import { useRef, useEffect, useState } from 'react';
import catSpriteImg from "../assets/cat-sprite.png";

const ROW_MAP: Record<string, number> = {
  idle: 0, groom: 2, alert: 3, walk: 4, run: 5, sleep: 6, creep: 7, jump: 8, pounce: 9,
};
const img = new Image();
img.src = catSpriteImg;

const PetCanvas = ({ status, onPetClick, onAnimationEnd, petName }: { status: string; onPetClick?: () => void; onAnimationEnd?: () => void, petName: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const frameRef = useRef(0);
  const animationIdRef = useRef<number>(0);

  const frameCountRef = useRef(0);

  const posXRef = useRef(48); // 현재 X 위치 (0 ~ 128-32)
  const posYRef = useRef(64);
  const dirXRef = useRef(1);  // X 방향 (1: 우, -1: 좌)
  const dirYRef = useRef(1);  // Y 방향 (1: 하, -1: 상)

  const [hoveredUser, setHoveredUser] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null); // 타이머 관리용

  const spriteWidth = 32;
  const spriteHeight = 32;
  const canvasRes = 128;
  const scaleMultiplier = 2;
  const renderWidth = spriteWidth * scaleMultiplier;
  const renderHeight = spriteHeight * scaleMultiplier;
  const collisionPadding = 8 * scaleMultiplier;

  useEffect(() => {
    if (canvasRef.current) {
      const context = canvasRef.current.getContext('2d', {
        willReadFrequently: true, // 여기서 딱 한 번 설정!
        alpha: true
      });
      ctxRef.current = context;
    }
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // 1. 움직이는 동안에는 툴팁을 끕니다.
    setHoveredUser(null);
    setMousePos({ x, y });

    // 2. 기존 타이머가 있다면 취소합니다. (움직이는 중에는 안 뜸)
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
    }

    // 3. 고양이 충돌 검사
    const canvasX = Math.floor(x * (canvas.width / rect.width));
    const canvasY = Math.floor(y * (canvas.height / rect.height));

    try {
      const pixel = ctx.getImageData(canvasX, canvasY, 1, 1).data;
      const isOverCat = pixel[3] > 10;
      canvas.style.cursor = isOverCat ? 'pointer' : 'default';

      // 4. 고양이 위에 있고 마우스가 멈추면 0.6초 뒤에 툴팁 표시
      if (isOverCat) {
        hoverTimerRef.current = setTimeout(() => {
          setHoveredUser(petName);
        }, 600); // 0.6초 대기 시간
      }
    } catch (err) {
      setHoveredUser(null);
    }
  };

  const handleCanvasClick = () => {
    setHoveredUser(null);
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);

    if (canvasRef.current?.style.cursor === 'pointer' && onPetClick) {
      onPetClick();
    }
  };

  useEffect(() => {
    const ctx = ctxRef.current;
    if (!ctx) return;

    const render = () => {
      if (!img.complete) {
        animationIdRef.current = requestAnimationFrame(render);
        return;
      }

      ctx.imageSmoothingEnabled = false;

      frameCountRef.current++;

      const currentRow = ROW_MAP[status] ?? 0;
      const repeatFrame = [4, 5, 9].includes(currentRow) ? 8 : (currentRow === 7 ? 6 : (currentRow === 8 ? 7 : 4));

      if (frameCountRef.current % 15 === 0) {
        if (status === 'pounce' && frameRef.current + 1 >= repeatFrame) {
          onAnimationEnd?.();
          frameRef.current = 0;
        } else {
          frameRef.current = (frameRef.current + 1) % repeatFrame;
        }
      }

      if (['walk', 'run', 'jump'].includes(status)) {
        const speed = status === 'walk' ? 0.3 : 0.5;

        posXRef.current += dirXRef.current * speed;

        if (posXRef.current >= canvasRes - renderWidth + collisionPadding) {
          posXRef.current = canvasRes - renderWidth + collisionPadding;
          dirXRef.current = -1;
        } else if (posXRef.current <= -collisionPadding) {
          dirXRef.current = 1;
        }

        posYRef.current += dirYRef.current * (speed * 0.7);
        if (posYRef.current >= canvasRes - renderHeight) {
          dirYRef.current = -1;
        } else if (posYRef.current <= 0) {
          dirYRef.current = 1;
        }
      }

      ctx.clearRect(0, 0, canvasRes, canvasRes);
      ctx.save();

      const centerX = posXRef.current + renderWidth / 2;
      if (dirXRef.current === -1) {
        ctx.translate(centerX, 0);
        ctx.scale(-1, 1);
        ctx.translate(-centerX, 0);
      }

      ctx.drawImage(
        img,
        10 + (frameRef.current * spriteWidth),
        10 + (currentRow * spriteHeight),
        spriteWidth,
        spriteHeight,
        Math.floor(posXRef.current),
        Math.floor(posYRef.current),
        renderWidth,
        renderHeight
      );

      ctx.restore();
      animationIdRef.current = requestAnimationFrame(render);
    };

    animationIdRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationIdRef.current);
  }, [status, collisionPadding, onAnimationEnd, renderHeight, renderWidth]);

  return (
    <div className="relative inline-block overflow-hidden rounded-[2rem]" style={{ width: '512px', height: '512px' }}>
      {hoveredUser && (
        <div
          className="absolute z-50 pointer-events-none animate-in fade-in slide-in-from-bottom-2 duration-200"
          style={{
            left: `${mousePos.x}px`,
            top: `${mousePos.y - 50}px`,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div className="bg-[#1a1c1e]/95 backdrop-blur-md text-white px-3 py-2 rounded-xl border border-white/10 shadow-2xl flex flex-col items-center">
            <span className="text-[13px] font-mono font-bold tracking-tight">
              {hoveredUser}
            </span>
            {/* 아래쪽 화살표 */}
            <div className="w-2 h-2 bg-[#1a1c1e] rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2 border-r border-b border-white/10"></div>
          </div>
        </div>
      )}
      <canvas
        ref={canvasRef}
        width={canvasRes}
        height={canvasRes}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredUser(null)}
        onClick={handleCanvasClick} // 클릭 이벤트 추가
        style={{
          imageRendering: 'pixelated',
          width: '512px',
          height: '512px',
        }}
      />
    </div>
  );
};

export default PetCanvas;