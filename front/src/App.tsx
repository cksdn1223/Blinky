import { useRef, useState } from "react";
import PetCanvas from "./components/PetCanvas";
import YouTubePlayer from "./components/YoutubePlayer";

function App() {
  const [videoUrl, setVideoUrl] = useState("first");
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
    <>
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#87c587] transition-colors duration-700">
        {/* 메인 콘텐츠 컨테이너 */}
        <div className="flex flex-col items-center p-6 space-y-4 bg-black/20 rounded-2xl backdrop-blur-sm border border-white/5 shadow-2xl">
          {/* 유튜브 플레이어 영역 */}
          <div className="w-full max-w-2xl overflow-hidden rounded-xl shadow-lg">
            {/* Tailwind 클래스를 전달하여 스타일링 */}
            <YouTubePlayer
              url={videoUrl}
              onUrlSubmit={(newUrl) => setVideoUrl(newUrl)}
              className="w-[640px] h-[360px] rounded-xl shadow-2xl border border-white/10"
            />
          </div>

          {/* 펫 캔버스 영역 */}
          <div className="relative group">
            <PetCanvas status={currentStatus} onPetClick={interactWithCat} />
            {/* 상태 표시 툴팁 혹은 라벨 */}
            <div className="absolute top-1 left-1/2 -translate-x-1/2 px-3 py-1 bg-gray-900/80 rounded-full border border-white/10 shadow-sm">
              <p className="text-xs font-mono text-green-400">
                STATUS: <span className="uppercase text-white">{currentStatus}</span>
              </p>
            </div>
          </div>
        </div>
        {/* 안내 문구 (개발자용 휴식 가이드) */}
        <footer className="mt-8 text-green-500/50 text-xs font-light">
          20-20-20 Rule: Every 20 minutes, look at something 20 feet away for 20 seconds.
        </footer>
      </div>
    </>
  );
}

export default App;