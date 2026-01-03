import { useCallback, useEffect, useState } from "react";
import Clock from "./components/Clock";
import PetCanvas from "./components/PetCanvas";
import YouTubePlayer from "./components/YoutubePlayer";
import { useBlinkyLogic } from "./hooks/useBlinkyLogic";
import { Check, Settings, Users, X } from "lucide-react";
import Equalizer from "./components/Equalizer";
import { AnimatePresence, motion } from "framer-motion";
import { sendEnd } from "./api/api";
import { useAuthStore, useUserStore } from "./store/useAuthStore";

const GOOGLE_LOGIN_URL = `${import.meta.env.VITE_BASE_URL}/oauth2/authorization/google`;
const PETNAME_SIZE = 10;

const getStatusStyles = (boredom: number) => {
  if (boredom >= 90) return { border: 'border-red-600', shadow: 'shadow-[0_0_15px_rgba(220,38,38,0.4)]', text: 'text-red-600' };
  if (boredom >= 80) return { border: 'border-red-500', shadow: 'shadow-[0_0_12px_rgba(239,68,68,0.3)]', text: 'text-red-500' };
  if (boredom >= 70) return { border: 'border-orange-500', shadow: 'shadow-[0_0_10px_rgba(249,115,22,0.2)]', text: 'text-orange-500' };
  if (boredom >= 60) return { border: 'border-yellow-500', shadow: 'shadow-[0_0_8px_rgba(234,179,8,0.2)]', text: 'text-yellow-500' };
  if (boredom >= 50) return { border: 'border-yellow-300', shadow: 'shadow-[0_0_5px_rgba(253,224,71,0.1)]', text: 'text-yellow-300' };

  // 기본 상태 (50% 미만)
  return { border: 'border-green-500/30', shadow: 'shadow-[0_0_15px_rgba(34,197,94,0.1)]', text: 'text-green-400' };
};

const formatTimer = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  // 시간이 0이면 '00:00' 형태로, 있으면 '90:02:12' 형태로
  const displayH = h > 0 ? `${h}:` : '';
  const displayM = m < 10 && h > 0 ? `0${m}` : m;
  const displayS = s < 10 ? `0${s}` : s;

  return `${displayH}${displayM}:${displayS}`;
};

const getKSTNow = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  const kstDate = new Date(now.getTime() - offset);
  return kstDate.toISOString().split('.')[0]; // 밀리초 제외
};

function App() {
  const { token, setToken, logout } = useAuthStore();
  const { userStats, fetchStats, updateAfterSession } = useUserStore();
  const { status, stats, interact, setStatus } = useBlinkyLogic();
  const [isPlaying, setIsPlaying] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [startTime, setStartTime] = useState<string | null>(null); // 시작 시간 저장
  const [currentVideoIds, setCurrentVideoIds] = useState<string[]>([]); // 현재 세션 영상들
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const petName = userStats?.petNickname || "Blinky";
  const [tempName, setTempName] = useState(petName);
  const styles = getStatusStyles(stats.boredom);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get('token');

    if (tokenFromUrl) {
      setToken(tokenFromUrl);
      window.history.replaceState({}, document.title, window.location.pathname);
      fetchStats();
    } else if (token) {
      fetchStats();
    }
  }, [token, setToken, fetchStats]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (token) {
      if (!startTime) setStartTime(getKSTNow());
      interval = setInterval(() => {
        setSessionTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [token, startTime]);

  const endSession = useCallback(async () => {
    if (!startTime || sessionTime < 5) {
      console.log("세션이 너무 짧아 저장하지 않습니다.");
      setStartTime(getKSTNow()); // 다시 시작 시간만 갱신
      setSessionTime(0);
      return;
    }
    try {
      const data = await sendEnd(startTime, currentVideoIds, stats.happiness, stats.boredom);
      if (data && data.totalFocusTime !== undefined) {
        updateAfterSession(
          data.totalFocusTime,
          stats.happiness,
          stats.boredom
        )
      }
      // 성공 시 초기화
      setStartTime(getKSTNow());
      setSessionTime(0);
      setCurrentVideoIds([]);
    } catch (error) {
      console.error("세션 저장 실패:", error);
    }
  }, [currentVideoIds, startTime, sessionTime, stats.happiness, stats.boredom, updateAfterSession]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (startTime) endSession();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [startTime, endSession]);

  // 설정창이 열릴 때마다 진짜 이름을 임시 이름에 복사
  useEffect(() => {
    if (isSettingsOpen) {
      setTempName(petName);
    }
  }, [isSettingsOpen, petName]);

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen animate-bg-pulse transition-all duration-700 p-4 relative">
        <div className="absolute top-4 right-4">
          {!token ? (
            <a href={GOOGLE_LOGIN_URL} className="px-4 py-2 bg-white text-black rounded-full font-bold text-sm shadow-lg">
              Google Login
            </a>
          ) : (
            <button onClick={logout} className="px-4 py-2 bg-black/10 text-black/50 rounded-full text-sm">
              Logout
            </button>
          )}
        </div>

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
              {formatTimer(userStats?.totalFocusTime || 0)}
            </p>
          </div>
        </div>

        <YouTubePlayer
          className="w-full max-w-[700px] h-[100px] rounded-3xl mb-4"
          setIsPlaying={setIsPlaying}
          onVideoChange={(videoId) => {
            setCurrentVideoIds(prev => prev.includes(videoId) ? prev : [...prev, videoId]);
          }}
        />

        <div className="w-full max-w-[700px] p-8 bg-gradient-to-br from-[#557a55]/90 to-[#4a6b4a]/80 rounded-[2.5rem] backdrop-blur-2xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] relative">

          <div className="flex flex-col items-center relative z-10 pt-14">
            {/* 왼쪽 상단 상태 칩 */}
            <div className={`absolute top-0 left-0 px-4 py-2.5 bg-[#1a1c1e] rounded-full border transition-all duration-700 ${styles.border} ${styles.shadow}`}>
              <p className="text-[12px] font-black font-mono tracking-[0.1em] text-white">
                <span className={styles.text}>심심해:</span>{Math.floor(stats.boredom)}%
              </p>
            </div>

            {/* 오른쪽 상단 버튼 그룹 및 설정 패널 앵커 */}
            <div className="absolute top-0 right-0 flex items-center gap-2.5 h-10">
              <button className="px-4 py-2.5 bg-[#1a1c1e] rounded-full border border-white/10 shadow-xl hover:bg-[#2a2d31] hover:border-green-500/50 hover:shadow-[0_0_15px_rgba(34,197,94,0.2)] transition-all duration-200 active:scale-95 group/btn text-white/50">
                <Users size={18} />
              </button>

              {/* 설정 버튼과 패널을 감싸는 Relative 컨테이너 */}
              <div className="relative">
                <button
                  className={`px-4 py-2.5 bg-[#1a1c1e] rounded-full border border-white/10 shadow-xl 
                    hover:bg-[#2a2d31] hover:border-green-500/50 hover:shadow-[0_0_15px_rgba(34,197,94,0.2)] transition-all duration-200 active:scale-95 group/btn
                  ${isSettingsOpen ? "border-green-500/50 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.2)]" : "text-white/50"}`}
                  onClick={() => setIsSettingsOpen(prev => !prev)}
                >
                  <Settings size={18} />
                </button>

                {/* 설정 패널 */}
                <AnimatePresence>
                  {isSettingsOpen && (
                    <motion.div
                      // 시작: 기준점보다 오른쪽(x: 100), 위쪽(y: -100)에서 작게 시작
                      initial={{ opacity: 0, x: 0, y: 0, scale: 0.35 }}
                      // 도착: 원래 위치(0, 0)
                      animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                      // 퇴장: 기준점보다 왼쪽(x: -100), 아래쪽(y: 100)으로 사라짐
                      exit={{ opacity: 0, x: 0, y: 0, scale: 0.35 }}
                      className="absolute right-0 top-0 w-[350px] bg-[#1a1c1e] border border-white/10 rounded-[1.4rem] p-6 shadow-[20px_20px_60px_rgba(0,0,0,0.5)] z-[100] origin-top-right"
                    >
                      {/* 상단 헤더 섹션 */}
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                          <span className="text-white font-mono font-black text-[10px] uppercase tracking-widest opacity-50">Setting</span>
                        </div>
                        <button
                          onClick={() => {
                            setTempName(petName); // 취소 시 원래 이름으로 복구
                            setIsSettingsOpen(false);
                          }}
                          className="text-white/20 hover:text-white transition-colors"
                        >
                          <X size={18} />
                        </button>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-end">
                          <label className="text-green-500 font-black text-[10px] uppercase tracking-[0.2em] ml-1">
                            이름 변경
                          </label>
                          <span className={`text-[10px] font-mono ${tempName.length >= PETNAME_SIZE ? 'text-red-500' : 'text-white/40'}`}>
                            {tempName.length}/{PETNAME_SIZE}
                          </span>
                        </div>

                        <div className="relative flex items-end gap-3 group">
                          <div className="relative flex-1">
                            <input
                              type="text"
                              value={tempName} // 실제 이름이 아닌 임시 이름 연결
                              onChange={(e) => {
                                const value = e.target.value;
                                const regex = /^[ㄱ-ㅎ|가-힣|a-z|A-Z|0-9]*$/;
                                if (regex.test(value) && value.length <= PETNAME_SIZE) {
                                  setTempName(value); // 임시 상태만 변경
                                }
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && tempName.length > 0) {
                                  // TODO: handlePetname 으로 변경해야함
                                  // setPetName(tempName); // 엔터 누를 때만 실제 이름 반영
                                  setIsSettingsOpen(false);
                                }
                              }}
                              placeholder="공백없이 입력"
                              className="w-full bg-transparent border-b-2 border-white/10 py-2 text-2xl font-bold text-white outline-none focus:border-green-500 transition-all placeholder:text-white/5"
                              autoFocus
                            />
                            <div className="absolute bottom-0 left-0 h-[2px] bg-green-500 w-0 group-focus-within:w-full transition-all duration-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                          </div>

                          <button
                            disabled={tempName.length === 0}
                            onClick={() => {
                              // TODO: handlePetname으로 변경해야함
                              // setPetName(tempName); // 버튼 클릭 시에만 실제 이름 반영
                              setIsSettingsOpen(false);
                            }}
                            // disabled 상태일 때 transform(scale)과 hover 효과를 완전히 제거
                            className="mb-1 p-2.5 bg-green-500 text-[#1a1c1e] rounded-xl transition-all flex items-center justify-center shadow-[0_0_15px_rgba(34,197,94,0.3)]
                            enabled:hover:bg-green-400 enabled:hover:scale-105 enabled:active:scale-95
                            disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none"
                          >
                            <Check size={20} strokeWidth={3} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <PetCanvas
              status={status}
              onPetClick={interact}
              onAnimationEnd={() => setStatus('sleep')}
              petName={petName}
            />
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