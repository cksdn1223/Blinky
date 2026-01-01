import { useRef, useState } from "react";
import PetCanvas from "./components/PetCanvas";
import YouTubePlayer from "./components/YoutubePlayer";

function App() {

  const [currentStatus, setCurrentStatus] = useState("idle");
  const doing = useRef(false);

  const interactWithCat = () => {
    if (doing.current) return;

    doing.current = true;
    console.log("고양이가 기분 좋아 보입니다!");
    setCurrentStatus("groom"); // 클릭하면 그루밍 동작으로 변경

    setTimeout(() => {
      setCurrentStatus("idle")
      doing.current = false;
    }, 3000);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#87c587] transition-all duration-700">
      {/* 유튜브 플레이어 */}
      <YouTubePlayer
        className="w-full max-w-[700px] h-[100px] rounded-3xl mb-8"
      />
      <div className="w-full max-w-[700px] p-8 bg-[#557a55]/80 rounded-[2.5rem] backdrop-blur-2xl border border-white/5 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)]">
        <div className="flex flex-col items-center">
          <div className="relative group w-full flex justify-center pt-14">

            {/* 1. 왼쪽 상단: STATUS 표시 칩 */}
            <div className="absolute top-0 left-0 px-4 py-2.5 bg-[#1a1c1e] rounded-full border border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.1)]">
              <p className="text-[10px] font-black font-mono text-green-400 tracking-[0.1em]">
                STATUS: <span className="text-white uppercase">{currentStatus}</span>
              </p>
            </div>

            {/* 2. 오른쪽 상단: 버튼 그룹 (3개) */}
            <div className="absolute top-0 right-0 flex items-center gap-2.5">
              {['STATS', 'SOCIAL', 'SETTINGS'].map((label) => (
                <button
                  key={label}
                  className="px-4 py-2.5 bg-[#1a1c1e] rounded-full border border-white/10 shadow-xl 
                      hover:bg-[#2a2d31] hover:border-green-500/50 hover:shadow-[0_0_15px_rgba(34,197,94,0.2)]
                      transition-all duration-200 active:scale-95 group/btn"
                >
                  <p className="text-[10px] font-black font-mono text-white/50 tracking-[0.1em] group-hover/btn:text-green-400">
                    {label}
                  </p>
                </button>
              ))}
            </div>

            {/* 펫 캔버스 */}
            <PetCanvas status={currentStatus} onPetClick={interactWithCat} />

          </div>
        </div>
      </div>

      <footer className="mt-10 opacity-30 flex items-center gap-4">
        <div className="h-[1px] w-12 bg-black"></div>
        <p className="text-[10px] font-bold tracking-[0.3em] text-black uppercase">EyeGotchi v1.0</p>
        <div className="h-[1px] w-12 bg-black"></div>
      </footer>
    </div>
  );
}


export default App;