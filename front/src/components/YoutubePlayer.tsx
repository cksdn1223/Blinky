
import { useEffect, useRef } from 'react';
import { ClipboardPaste, PlayCircle } from 'lucide-react';

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
  }
}

interface YouTubePlayerProps {
  url: string;
  className?: string;
  onUrlSubmit: (newUrl: string) => void; // URL을 제출받을 부모의 함수
}

const YouTubePlayer = ({ url, className, onUrlSubmit }: YouTubePlayerProps) => {
  const playerRef = useRef<YT.Player | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const getYoutubeId = (url: string) => {
    if (!url || url === "first") return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const handlePlaceholderClick = async () => {
    try {
      // 브라우저에 클립보드 읽기 권한 요청 및 텍스트 가져오기
      const text = await navigator.clipboard.readText();
      const videoId = getYoutubeId(text);

      if (videoId) {
        onUrlSubmit(text);
      } else {
        alert("클립보드에 올바른 유튜브 주소가 없습니다!");
      }

    } catch (err) {
      console.error("클립보드 읽기 실패:", err);
      alert("클립보드 접근 권한이 거부되었거나 지원되지 않는 브라우저입니다.");
    }
  };

  useEffect(() => {
    // API 스크립트 로드
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    const initPlayer = () => {
      const videoId = getYoutubeId(url);
      if (!videoId || !containerRef.current) return;

      if (playerRef.current) {
        playerRef.current.destroy();
      }

      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId: videoId,
        playerVars: {
          rel: 0,
          controls: 1,
          modestbranding: 1,
          autoplay: 1,        // 자동재생 설정
          mute: 0
        },
        events: {
          onReady: (event: YT.PlayerEvent) => {
            event.target.playVideo(); // 준비되면 바로 재생
          },
        }
      });
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      if (playerRef.current) playerRef.current.destroy();
    };
  }, [url]);

  return (
    <div className={`${className} relative bg-black flex items-center justify-center overflow-hidden`}>
      {url === "first" ? (
        <div
          onClick={handlePlaceholderClick}
          className="group cursor-pointer flex flex-col items-center justify-center w-full h-full bg-slate-800 hover:bg-slate-700 transition-all border-2 border-dashed border-white/10 hover:border-green-500/50"
        >
          <div className="relative">
            <PlayCircle className="w-16 h-16 text-white/20 group-hover:text-green-500/80 group-hover:scale-110 transition-all duration-500" strokeWidth={1} />
            <ClipboardPaste className="absolute -bottom-1 -right-1 w-6 h-6 text-green-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </div>
          <p className="mt-4 text-white/60 text-sm font-medium">유튜브 링크 복사 후 클릭하세요</p>
          <span className="mt-1 text-white/30 text-[10px] uppercase tracking-widest font-mono">Paste from Clipboard</span>
        </div>
      ) : (
        <div ref={containerRef} className="w-full h-full"></div>
      )}
    </div>
  );
};

export default YouTubePlayer;