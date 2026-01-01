import { useEffect, useRef, useState } from 'react';
import { Play, ListMusic, Trash2, X, Plus, Repeat1, Repeat } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
  }
}
type PlaylistItem = {
  id: string;
  title: string;
  url: string;
}

type YouTubePlayerProps = {
  className?: string;
}

const YouTubePlayer = ({ className }: YouTubePlayerProps) => {
  const [videoUrl, setVideoUrl] = useState("first");
  const playerRef = useRef<YT.Player | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [videoTitle, setVideoTitle] = useState<string>("YOUTUBE 링크를 복사 후 재생버튼을 눌러주세요.");
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [playlist, setPlaylist] = useState<PlaylistItem[]>([]);
  const playlistRef = useRef<PlaylistItem[]>(playlist);
  const [isListOpen, setIsListOpen] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const isRepeatRef = useRef(isRepeat);

  useEffect(() => {
    isRepeatRef.current = isRepeat;
  }, [isRepeat]);
  useEffect(() => {
    playlistRef.current = playlist;
  }, [playlist]);

  const getYoutubeId = (url: string): string | null => {
    if (!url || url === "first") return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };
  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const handleAddToList = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const videoId = getYoutubeId(text);

      if (videoId) {
        if (!playlist.find(item => item.id === videoId)) {
          const res = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
          const data = await res.json();
          const newItem = { id: videoId, title: data.title, url: text };
          setPlaylist(prev => [...prev, newItem]);
        } else {
          alert("이미 목록에 있는 곡입니다.");
        }
      }
    } catch (e) { console.error("클립보드 읽기 오류") }
  };

  const handlePasteAndPlay = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const videoId = getYoutubeId(text);
      if (videoUrl !== "first") {
        handleAddToList();
        return;
      }
      if (videoId) {
        if (!playlist.find(item => item.id === videoId)) {
          const res = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
          const data = await res.json();
          const newItem = { id: videoId, title: data.title, url: text };
          setPlaylist(prev => [...prev, newItem]);
        }
        setVideoUrl(text); // 즉시 재생
      }
    } catch (e) { console.error("클립보드 재생 오류") }
  };

  const removeFromPlaylist = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // 부모 클릭 이벤트(재생) 방지
    setPlaylist(prev => prev.filter(item => item.id !== id));
  };

  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
    }

    const videoId = getYoutubeId(videoUrl);
    let interval: ReturnType<typeof setInterval>;
    // 영상 제목 가져오기 (oEmbed API)
    if (videoId && videoUrl !== "first") {
      fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`)
        .then(res => res.json())
        .then(data => setVideoTitle(data.title))
        .catch(() => setVideoTitle("재생 중인 음악"));
    }

    const initPlayer = (): void => {
      if (!videoId || !containerRef.current) return;
      if (playerRef.current) playerRef.current.destroy();

      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId: videoId,
        playerVars: { autoplay: 1, rel: 0, controls: 0, modestbranding: 1 },
        events: {
          onReady: (e: YT.PlayerEvent) => {
            e.target.playVideo();
            setDuration(e.target.getDuration() - 1); // 전체 길이 설정
          },
          onStateChange: (e: YT.OnStateChangeEvent) => {
            // 재생 중일 때만 인터벌 가동
            if (e.data === window.YT.PlayerState.PLAYING) {
              interval = setInterval(() => {
                if (playerRef.current) {
                  setCurrentTime(playerRef.current.getCurrentTime());
                }
              }, 1000);
            } else if (e.data === window.YT.PlayerState.ENDED) {
              clearInterval(interval);
              if (isRepeatRef.current) {
                e.target.playVideo();
              } else {
                const currentPlaylist = playlistRef.current;
                const currentIndex = currentPlaylist.findIndex(item => item.id === videoId);

                if (currentIndex !== -1) {
                  const nextItem = currentPlaylist[currentIndex + 1];
                  if (nextItem) {
                    setVideoUrl(nextItem.url);
                  } else {
                    setVideoUrl("first");
                    setVideoTitle("YOUTUBE 링크를 복사 후 재생버튼을 눌러주세요.");
                    setCurrentTime(0);
                    setDuration(0);
                  }

                  setPlaylist(prev => prev.filter(item => item.id !== videoId));
                }
              }
            } else {
              clearInterval(interval);
            }
          }
        },
      });
    };

    if (window.YT && window.YT.Player) initPlayer();
    else window.onYouTubeIframeAPIReady = initPlayer;

    return () => {
      if (playerRef.current) playerRef.current.destroy();
      clearInterval(interval);
    };
  }, [videoUrl, setVideoUrl]);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className={`${className} relative flex flex-row bg-[#1a1c1e] rounded-3xl border border-white/10 shadow-2xl overflow-visible`}>

      {/* 재생목록 드롭다운 */}
      {isListOpen && (
        <div className="absolute bottom-[calc(100%+12px)] right-0 w-[300px] z-[100] bg-[#1a1c1e]/95 backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
          <div className="flex justify-between items-center mb-3 border-b border-white/5 pb-2">
            <span className="text-[10px] font-black text-green-500 uppercase tracking-[0.2em]">Playlist ({playlist.length})</span>
            <button onClick={() => setIsListOpen(false)} className="text-white/20 hover:text-white">
              <X size={16} />
            </button>
          </div>
          <div className="overflow-y-auto max-h-[200px] pr-1 custom-scrollbar">
            {playlist.length === 0 ? (
              <p className="text-white/20 text-[11px] text-center py-10 font-mono">No tracks added yet.</p>
            ) : (
              playlist.map((item) => (
                <div
                  key={item.id}
                  // onClick={() => { onUrlSubmit(item.url); setIsListOpen(false); }}
                  className="flex items-center justify-between p-2.5 hover:bg-white/[0.03] rounded-xl cursor-pointer group transition-all mb-1.5 border border-transparent hover:border-white/5"
                >
                  <span className={`text-[11px] truncate mr-3 ${getYoutubeId(videoUrl) === item.id ? 'text-green-400 font-bold' : 'text-white/60 group-hover:text-white'}`}>
                    {getYoutubeId(videoUrl) === item.id && "▶ "}{item.title}
                  </span>
                  <button
                    onClick={(e) => removeFromPlaylist(e, item.id)}
                    className="text-white/10 hover:text-red-500 opacity-0 group-hover:opacity-100 p-1"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Video Area */}
      <div className="w-[28%] bg-black relative flex items-center justify-center border-r border-white/5 overflow-hidden rounded-l-3xl">
        {videoUrl === "first" ? (
          <div className="flex flex-col items-center opacity-10">
            <Play size={24} className="text-white" fill="currentColor" />
          </div>
        ) : (
          <div ref={containerRef} className="w-full h-full"></div>
        )}
      </div>

      {/* Info */}
      <div className="w-[72%] p-5 flex flex-col justify-center bg-gradient-to-r from-green-900/[0.05] to-transparent">
        <div className="flex justify-between items-center mb-4">

          {/* 제목 애니메이션 영역 */}
          <div className="flex flex-col overflow-hidden mr-4 min-w-[320px] h-[40px] justify-center">
            <span className="text-[9px] text-green-500 font-mono font-bold uppercase tracking-[0.15em] mb-1 opacity-70">
              System Online
            </span>

            <div className="relative h-[20px] overflow-hidden"> {/* 애니메이션이 일어날 박스 */}
              <AnimatePresence mode="wait">
                <motion.h3
                  key={videoTitle} // key가 바뀌면 애니메이션이 실행됨
                  initial={{ y: 20, opacity: 0 }}   // 아래에서 시작
                  animate={{ y: 0, opacity: 1 }}    // 제자리로
                  exit={{ y: -20, opacity: 0 }}    // 위로 사라짐
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="text-white font-bold text-sm truncate tracking-tight absolute w-full"
                >
                  {videoTitle}
                </motion.h3>
              </AnimatePresence>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button onClick={handleAddToList} className="p-2 text-white/30 hover:text-green-400 hover:bg-white/5 rounded-xl transition-all">
              <Plus size={18} />
            </button>
            <button onClick={handlePasteAndPlay} className="p-2 text-white/30 hover:text-red-500 hover:bg-white/5 rounded-xl transition-all">
              <Play size={18} fill={videoUrl !== "first" ? "currentColor" : "none"} />
            </button>
            <button onClick={() => setIsListOpen(!isListOpen)} className={`p-2 rounded-xl transition-all ${isListOpen ? 'bg-green-500/10 text-green-400' : 'text-white/30 hover:text-green-400'}`}>
              <ListMusic size={20} />
            </button>
          </div>
        </div>

        {/* 재생바 및 반복 버튼 영역 */}
        {videoUrl !== "first" && (
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="h-1 flex-1 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 shadow-[0_0_12px_#22c55e] transition-all duration-1000 ease-linear"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
              {/* 반복 재생 토글 버튼 */}
              <button
                onClick={() => setIsRepeat(!isRepeat)}
                className={`transition-colors ${isRepeat ? 'text-green-400' : 'text-white/20 hover:text-white'}`}
                title={isRepeat ? "Repeat ON" : "Repeat OFF"}
              >
                {isRepeat ? <Repeat1 size={14} /> : <Repeat size={14} />}
              </button>
            </div>
            <div className="flex justify-between text-[9px] font-mono text-white/20 tracking-widest font-bold">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default YouTubePlayer;