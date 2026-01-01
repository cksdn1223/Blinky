import { useRef, useEffect } from 'react';
import catSpriteImg from "../assets/cat-sprite.png";

const ROW_MAP: Record<string, number> = {
  idle: 0, blink: 1, groom: 2, alert: 3, walk: 4, run: 5, sleep: 6, creep: 7, jump: 8, pounce: 9,
};

const PetCanvas = ({ status, onPetClick }: { status: string; onPetClick?: () => void }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const frameRef = useRef(0);
  const frameCountRef = useRef(0);
  const animationIdRef = useRef<number>(0);

  const spriteWidth = 32;
  const spriteHeight = 32;
  const offsetX = 10;
  const offsetY = 10;

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();

    // 1. 캔버스 해상도에 맞게 마우스 좌표 변환 (256px -> 128px)
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    // 2. 해당 좌표의 픽셀 데이터 읽기 (RGBA 중 A값 확인)
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const isTransparent = pixel[3] === 0; // 알파값이 0이면 투명

    // 3. 투명하지 않을 때만 포인터로 변경
    canvas.style.cursor = isTransparent ? 'default' : 'pointer';
  };

  const handleCanvasClick = () => {
    if (canvasRef.current?.style.cursor === 'pointer' && onPetClick) {
      onPetClick();
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const startAnimating = () => {
      if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current);

      const render = () => {
        if (!imgRef.current) return;
        ctx.imageSmoothingEnabled = false;
        frameCountRef.current++;

        const currentRow = ROW_MAP[status] ?? 0;
        let repeatFrame = 4;
        if ([4, 5, 9].includes(currentRow)) repeatFrame = 8;
        else if (currentRow === 7) repeatFrame = 6;
        else if (currentRow === 8) repeatFrame = 7;

        if (frameCountRef.current % 10 === 0) {
          frameRef.current = (frameRef.current + 1) % repeatFrame;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(
          imgRef.current,
          offsetX + (frameRef.current * spriteWidth),
          offsetY + (currentRow * spriteHeight),
          spriteWidth,
          spriteHeight,
          0, 0,
          canvas.width,
          canvas.height
        );

        animationIdRef.current = requestAnimationFrame(render);
      };
      render();
    };

    if (!imgRef.current) {
      const img = new Image();
      img.src = catSpriteImg;
      img.onload = () => {
        imgRef.current = img;
        startAnimating();
      };
    } else {
      frameRef.current = 0;
      startAnimating();
    }

    return () => {
      if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current);
    };
  }, [status]);

  return (
    <canvas
      ref={canvasRef}
      width={128}
      height={128}
      onMouseMove={handleMouseMove}
      onClick={handleCanvasClick} // 클릭 이벤트 추가
      style={{
        imageRendering: 'pixelated',
        width: '256px',
        height: '256px',
      }}
    />
  );
};

export default PetCanvas;