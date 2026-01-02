import { useCallback, useState } from "react";
import Clock from "./components/Clock";
import PetCanvas from "./components/PetCanvas";
import YouTubePlayer from "./components/YoutubePlayer";
import { useBlinkyLogic } from "./hooks/useBlinkyLogic";
import { Settings, Users } from "lucide-react";
import Equalizer from "./components/Equalizer";

const getStatusStyles = (boredom: number) => {
  if (boredom >= 90) return { border: 'border-red-600', shadow: 'shadow-[0_0_15px_rgba(220,38,38,0.4)]', text: 'text-red-600' };
  if (boredom >= 80) return { border: 'border-red-500', shadow: 'shadow-[0_0_12px_rgba(239,68,68,0.3)]', text: 'text-red-500' };
  if (boredom >= 70) return { border: 'border-orange-500', shadow: 'shadow-[0_0_10px_rgba(249,115,22,0.2)]', text: 'text-orange-500' };
  if (boredom >= 60) return { border: 'border-yellow-500', shadow: 'shadow-[0_0_8px_rgba(234,179,8,0.2)]', text: 'text-yellow-500' };
  if (boredom >= 50) return { border: 'border-yellow-300', shadow: 'shadow-[0_0_5px_rgba(253,224,71,0.1)]', text: 'text-yellow-300' };

  // 기본 상태 (50% 미만)
  return { border: 'border-green-500/30', shadow: 'shadow-[0_0_15px_rgba(34,197,94,0.1)]', text: 'text-green-400' };
};


function App() {
  const { status, stats, interact, setStatus } = useBlinkyLogic();
  const [isPlaying, setIsPlaying] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [totalTime, setTotalTime] = useState(0); // 실제로는 로컬스토리지 등에서 불러와야 함

  const handleTick = useCallback(() => {
    setSessionTime(prev => prev + 1);
    setTotalTime(prev => prev + 1);
  }, []);

  const formatTimer = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? h + ':' : ''}${m < 10 && h > 0 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const styles = getStatusStyles(stats.boredom);

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen animate-bg-pulse transition-all duration-700 p-4">

        <div className="w-full max-w-[700px] mb-6 px-2 flex justify-between items-end border-b-2 border-black/10 pb-4">
          <div className="flex flex-col">
            <span className="text-[11px] font-mono font-black text-black/40 uppercase tracking-[0.2em] mb-1">
              Focus Session
            </span>
            <div className="flex items-baseline gap-2">
              <p className="text-5xl font-mono font-black text-[#1a1c1e] tabular-nums tracking-tighter">
                {formatTimer(sessionTime)}
              </p>
              <span className="text-sm font-bold text-black/40 uppercase">IN FLOW</span>
            </div>
          </div>
          <Equalizer isPlaying={isPlaying} />
          <div className="flex flex-col items-end">
            <span className="text-[11px] font-mono font-black text-black/40 uppercase tracking-[0.2em] mb-1">
              Total Accumulation
            </span>
            <p className="text-xl font-mono font-black text-black/60 tabular-nums">
              {formatTimer(totalTime)}
            </p>
          </div>
        </div>

        <YouTubePlayer
          className="w-full max-w-[700px] h-[100px] rounded-3xl mb-4"
          onTick={handleTick}
          setIsPlaying={setIsPlaying}
        />

        <div className="w-full max-w-[700px] p-8 
        bg-gradient-to-br from-[#557a55]/90 to-[#4a6b4a]/80
        rounded-[2.5rem] backdrop-blur-2xl
        shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] 
        relative overflow-hidden">
          {/* 노이즈 레이어: 가시성을 위해 opacity를 0.05로 살짝 올렸습니다 */}
          <div className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] bg-[radial-gradient(circle,rgba(255,255,255,0.1)_0%,transparent_50%)] pointer-events-none" />

          <div className="flex flex-col items-center relative z-10">
            <div className="relative group w-full flex justify-center pt-14">

              {/* 1. 왼쪽 상단: STATUS 표시 칩 */}
              <div className={`absolute top-0 left-0 px-4 py-2.5 bg-[#1a1c1e] rounded-full border transition-all duration-700 ${styles.border} ${styles.shadow}`}>
                <p className="text-[12px] font-black font-mono tracking-[0.1em] transition-colors duration-700">
                  <span className={styles.text}>
                    심심해:
                  </span>
                  <span className="text-white uppercase ml-1">
                    {Math.floor(stats.boredom)}%
                  </span>
                </p>
              </div>

              {/* 2. 오른쪽 상단: 버튼 그룹 (3개) */}
              <div className="absolute top-0 right-0 flex items-center gap-2.5">
                {['SOCIAL', 'SETTINGS'].map((label) => (
                  <button
                    key={label}
                    className="px-4 py-2.5 bg-[#1a1c1e] rounded-full border border-white/10 shadow-xl 
                      hover:bg-[#2a2d31] hover:border-green-500/50
                      hover:shadow-[0_0_15px_rgba(34,197,94,0.2)]
                      transition-all duration-200 active:scale-95 group/btn"
                  >
                    <p className="text-[12px] font-black font-mono text-white/50 tracking-[0.1em] group-hover/btn:text-green-400">
                      {label === 'SOCIAL' ? <Users size={18} /> : <Settings size={18} />}
                    </p>
                  </button>
                ))}
              </div>

              {/* 펫 캔버스 */}
              <PetCanvas status={status} onPetClick={interact} onAnimationEnd={() => setStatus('sleep')} />

            </div>
          </div>
        </div>

        <footer className="mt-10 opacity-30 flex items-center gap-4">
          <div className="h-[1px] w-12 bg-black"></div>
          <p className="text-[10px] font-bold tracking-[0.3em] text-black uppercase">Blinky v1.0</p>
          <div className="h-[1px] w-12 bg-black"></div>
        </footer>

        <Clock />
      </div>
    </>
  );
}


export default App;