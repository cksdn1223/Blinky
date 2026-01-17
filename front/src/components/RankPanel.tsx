import { AnimatePresence, motion } from "framer-motion";
import { X, Crown, Medal } from "lucide-react";
import { useEffect, useState } from "react";
import { getRanks } from "../api/api";
import { RankPanelProps, RankUser } from "../types";

const formatTime = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
};

function RankPanel({ isRankOpen, setIsRankOpen }: RankPanelProps) {
  const [ranks, setRanks] = useState<RankUser[]>([]);
  const [myRank, setMyRank] = useState<RankUser | null>(null);

  useEffect(() => {
    (async () => {
      if (isRankOpen) {
        try {
          const data = await getRanks();
          if (data) {
            setRanks(data.top10);
            setMyRank(data.myRank);
          }
        } catch (error) {
          console.error("랭킹 불러오기 실패:", error);
        }
      }
    })();
  }, [isRankOpen]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown size={14} className="text-yellow-400 fill-yellow-400/20" />;
      case 2: return <Medal size={14} className="text-gray-300 fill-gray-300/20" />;
      case 3: return <Medal size={14} className="text-amber-600 fill-amber-600/20" />;
      default: return <span className="text-[10px] font-mono text-white/30">#{rank}</span>;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return "text-yellow-400 bg-yellow-400/5 border-yellow-400/20";
      case 2: return "text-gray-300 bg-gray-300/5 border-gray-300/20";
      case 3: return "text-amber-600 bg-amber-600/5 border-amber-600/20";
      default: return "text-white/70 hover:bg-white/5 border-transparent";
    }
  };

  return (
    <>
      {/* 스크롤바 숨기기 위한 글로벌 스타일 주입 */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;  /* IE and Edge */
            scrollbar-width: none;  /* Firefox */
        }
      `}</style>

      <AnimatePresence>
        {isRankOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className="fixed right-7 top-8 bottom-6 w-[340px] bg-[#1a1c1e]/95 backdrop-contrast-150 border border-white/10 rounded-[1.5rem] shadow-2xl z-[100] flex flex-col overflow-hidden"
          >
            {/* 헤더 */}
            <div className="flex justify-between items-center p-5 shrink-0 border-b border-white/5">
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(234,179,8,0.8)]" />
                <span className="text-white font-mono font-black text-[12px] uppercase tracking-[0.3em] opacity-80">
                  Ranking
                </span>
              </div>
              <button
                onClick={() => setIsRankOpen(false)}
                className="p-2 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white rounded-full transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* 랭킹 리스트 (남은 공간 모두 차지 flex-1) */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2.5 scrollbar-hide">
              {ranks.length === 0 ? (
                <div className="h-full flex items-center justify-center text-white/20 text-xs font-mono">
                  랭킹 불러오는 중...
                </div>
              ) : (
                ranks.map((user) => (
                  <div
                    key={user.rank}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all hover:scale-[1.02] active:scale-[0.98] ${getRankColor(user.rank)}`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-6 flex justify-center">
                        {getRankIcon(user.rank)}
                      </div>
                      <span className={`text-[13px] font-bold ${user.rank <= 3 ? 'font-mono' : ''}`}>
                        {user.nickname}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono opacity-60 font-medium">
                      {formatTime(user.totalFocusSec)}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* 내 순위 (하단 고정) */}
            {myRank && (
              <div className="shrink-0 p-4 pt-0">
                {/* 구분선 대신 위쪽 마진과 배경으로 분리 */}
                <div className="relative p-4 rounded-2xl bg-gradient-to-r from-green-500/10 to-emerald-500/5 border border-green-500/20">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#1a1c1e] px-2">
                    <span className="text-[9px] font-black text-green-500 uppercase tracking-widest">
                      My Rank
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-green-400 mt-1">
                    <div className="flex items-center gap-3">
                      <div className="w-6 flex justify-center text-[11px] font-mono font-black">
                        #{myRank.rank}
                      </div>
                      <span className="text-[13px] font-bold flex items-center gap-2 text-white">
                        {myRank.nickname}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono font-bold">
                      {formatTime(myRank.totalFocusSec)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default RankPanel;