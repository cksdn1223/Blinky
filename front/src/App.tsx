import { useCallback, useEffect } from "react";
import Clock from "./components/Clock";
import PetCanvas from "./components/PetCanvas";
import YouTubePlayer from "./components/YoutubePlayer";
import { useBlinkyLogic } from "./hooks/useBlinkyLogic";
import { Settings, Trophy, Users } from "lucide-react";
import Equalizer from "./components/Equalizer";
import { changePetNickname, changeUserNickname, sendEnd } from "./api/api";
import { useAuthStore, useSessionStore, useUIStore, useUserStore } from "./store/store";
import SettingPanel from "./components/SettingPanel";
import SocialPanel from "./components/SocialPanel";
import { useSse } from "./hooks/useSse";
import RankPanel from "./components/RankPanel";

function App() {
  useSse();
  const { token, setToken, logout } = useAuthStore();
  const { userStats, fetchStats, updateAfterSession, updateNicknames } = useUserStore();
  const { status, stats, interact, setStatus } = useBlinkyLogic();

  const { sessionTime, startTime, isPlaying, currentVideoIds, setStartTime, setIsPlaying, addVideoId, tick, resetSession } = useSessionStore();
  const { isSettingsOpen, isSocialOpen, isRankOpen, toggleSettings, toggleSocial, toggleRank, setSocialOpen, setRankOpen } = useUIStore();

  const styles = getStatusStyles(stats.boredom);

  // 초기 토큰 / 데이터 로드
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    if (token || tokenFromUrl) fetchStats();
  }, [token, setToken, fetchStats]);

  // 세션 시작 시각 설정
  useEffect(() => {
    if (token && !startTime) {
      setStartTime(getKSTNow());
    }
  }, [token, startTime, setStartTime]);

  // 타이머
  useEffect(() => {
    if (token && startTime) {
      const interval = setInterval(tick, 1000);
      return () => clearInterval(interval);
    }
  }, [token, startTime, tick]);

  // 세션 종료 로직
  const handleEndSession = useCallback(async () => {
    if (!userStats || !startTime || sessionTime < 5) {
      resetSession();
      return;
    }
    try {
      const data = await sendEnd(startTime, currentVideoIds, stats.happiness, stats.boredom, token);
      if (data?.totalFocusTime !== undefined) {
        updateAfterSession(data.totalFocusTime, stats.happiness, stats.boredom);
      }
      resetSession();
    } catch (error) {
      console.error("세션 저장 실패:", error);
    }
  }, [userStats, startTime, sessionTime, currentVideoIds, stats, token, resetSession, updateAfterSession]);

  // 창 닫을때 이벤트
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (startTime && sessionTime >= 5) handleEndSession();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [startTime, sessionTime, handleEndSession]);

  // 닉네임 변경 핸들러
  const handleUserNickname = async (name: string) => {
    try {
      await changeUserNickname(name);
      updateNicknames(name);
    } catch (error) {
      console.error("닉네임 변경 실패:", error);
    }
  };

  const handlePetNickname = async (name: string) => {
    try {
      await changePetNickname(name);
      updateNicknames(undefined, name);
    } catch (error) {
      console.error("펫 이름 변경 실패:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen animate-bg-pulse p-4 relative">
      {/* 로그인/로그아웃 섹션 */}
      <div className="absolute top-4 right-4">
        {!token ? (
          <a href={GOOGLE_LOGIN_URL} className="px-4 py-2 bg-white text-black rounded-full font-bold text-sm shadow-lg">Google Login</a>
        ) : (
          <button onClick={logout} className="px-4 py-2 bg-black/10 text-black/50 rounded-full text-sm">
            {userStats?.nickname} | Logout
          </button>
        )}
      </div>

      {/* 헤더: 타이머 & 이퀄라이저 */}
      <div className="w-full max-w-[700px] mb-6 px-2 flex justify-between items-end border-b-2 border-black/10 pb-4">
        <div className="flex flex-col">
          <span className="text-[11px] font-mono font-black text-black/40 uppercase tracking-[0.2em] mb-1">Focus Session</span>
          <div className="flex items-baseline gap-2">
            <p className="text-5xl font-mono font-black text-[#1a1c1e] tabular-nums tracking-tighter">{formatTimer(sessionTime)}</p>
            <span className="text-sm font-bold text-black/40 uppercase">IN FLOW</span>
          </div>
        </div>
        <Equalizer isPlaying={isPlaying} />
        <div className="flex flex-col items-end">
          <span className="text-[11px] font-mono font-black text-black/40 uppercase tracking-[0.2em] mb-1">Total Accumulation</span>
          <p className="text-xl font-mono font-black text-black/60 tabular-nums">{formatTimer(userStats?.totalFocusTime || 0)}</p>
        </div>
      </div>

      {/* 유튜브 플레이어 */}
      <YouTubePlayer
        className="w-full max-w-[700px] h-[100px] rounded-3xl mb-4"
        setIsPlaying={setIsPlaying}
        onVideoChange={addVideoId}
      />

      {/* 메인 캔버스 구역 */}
      <div className="w-full max-w-[700px] p-8 bg-gradient-to-br from-[#557a55]/90 to-[#4a6b4a]/80 rounded-[2.5rem] backdrop-blur-2xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] relative">
        <div className="flex flex-col items-center relative z-10 pt-14">
          {/* 상태 칩 */}
          <div className={`absolute top-0 left-0 px-4 py-2.5 bg-[#1a1c1e] rounded-full border transition-all duration-700 ${styles.border} ${styles.shadow}`}>
            <p className="text-[12px] font-black font-mono tracking-[0.1em] text-white">
              <span className={styles.text}>심심해:</span> {Math.floor(stats.boredom)}%
            </p>
          </div>

          {/* 우측 상단 버튼 그룹 */}
          <div className="absolute top-0 right-0 flex items-center gap-2.5 h-10">
            <div className="relative">
              <button
                className={`px-4 py-2.5 bg-[#1a1c1e] rounded-full border border-white/10 shadow-xl transition-all ${isSocialOpen ? "border-green-500 text-green-400" : "text-white/50"}`}
                onClick={toggleRank}
              >
                <Trophy size={18} />
              </button>
              <RankPanel isRankOpen={isRankOpen} setIsRankOpen={setRankOpen} />
            </div>

            <div className="relative">
              <button
                className={`px-4 py-2.5 bg-[#1a1c1e] rounded-full border border-white/10 shadow-xl transition-all ${isSocialOpen ? "border-green-500 text-green-400" : "text-white/50"}`}
                onClick={toggleSocial}
              >
                <Users size={18} />
              </button>
              <SocialPanel isSocialOpen={isSocialOpen} setIsSocialOpen={setSocialOpen} />
            </div>

            <div className="relative">
              <button
                className={`px-4 py-2.5 bg-[#1a1c1e] rounded-full border border-white/10 shadow-xl transition-all ${isSettingsOpen ? "border-green-500 text-green-400" : "text-white/50"}`}
                onClick={toggleSettings}
              >
                <Settings size={18} />
              </button>
              <SettingPanel
                userName={userStats?.nickname || "GUEST"}
                handleUserNickname={handleUserNickname}
                petName={userStats?.petNickname || "BLINKY"}
                handlePetNickname={handlePetNickname}
                setIsSettingsOpen={toggleSettings}
                isSettingsOpen={isSettingsOpen}
              />
            </div>
          </div>

          <PetCanvas
            status={status}
            onPetClick={interact}
            onAnimationEnd={() => setStatus('sleep')}
            petName={userStats?.petNickname || "BLINKY"}
          />
        </div>
      </div>

      <footer className="flex flex-col items-center mt-10">
        <div className="opacity-30 flex items-center gap-4">
          <div className="h-[1px] w-12 bg-black"></div>
          <p className="text-[10px] font-bold tracking-[0.3em] text-black uppercase">Blinky v1.0</p>
          <div className="h-[1px] w-12 bg-black"></div>
        </div>
        <Clock />
        {!token && <div className="text-[12px] mt-2 text-black/40 font-bold">시간을 저장하시려면 로그인해주세요.</div>}
      </footer>
    </div>
  );
}

const GOOGLE_LOGIN_URL = `${import.meta.env.VITE_BASE_URL}/oauth2/authorization/google`;

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


export default App;