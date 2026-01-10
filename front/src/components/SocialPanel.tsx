import { AnimatePresence, motion } from "framer-motion";
import { X, Search, Ghost } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { SearchUser } from "../types";
import { searchUser } from "../api/api"; // API 추가
import UserItem from "./UserItem";
import { useSocialStore } from "../store/store";

type TabType = "FOLLOWING" | "FOLLOWER";

function SocialPanel({ isSocialOpen, setIsSocialOpen }: { isSocialOpen: boolean; setIsSocialOpen: (open: boolean) => void }) {
  const { lists, fetchFriendsList, removeUserFromList } = useSocialStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>("FOLLOWING");
  const [isReady, setIsReady] = useState(false);

  const loadSocialData = useCallback(async () => {
    try {
      await fetchFriendsList(activeTab);
    } catch (error) {
      console.error("데이터 로드 실패:", error);
    }
  }, [activeTab, fetchFriendsList]);

  // 패널 열릴 때 초기화
  useEffect(() => {
    if (isSocialOpen) {
      loadSocialData();

      // 애니메이션 준비
      const timer = setTimeout(() => setIsReady(true), 250);
      return () => clearTimeout(timer);
    } else {
      setIsReady(false);
      setSearchQuery("");
    }
  }, [isSocialOpen, activeTab, loadSocialData]);

  // 검색 디바운싱
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed || trimmed === "@") {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const data = await searchUser(trimmed);
        setSearchResults(data);
      } catch (error) {
        console.error("검색 실패", error);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <AnimatePresence>
      {isSocialOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 10 }}
          transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
          className="absolute -right-16 top-0 w-[350px] h-[565px] bg-[#1a1c1e]/95 backdrop-blur-sm border border-white/10 rounded-[1.5rem] px-7 py-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[100] origin-top-right flex flex-col"
        >
          {/* 헤더 생략 (기존과 동일) */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
              <span className="text-white font-mono font-black text-[11px] uppercase tracking-[0.3em] opacity-70">Social</span>
            </div>
            <button onClick={() => setIsSocialOpen(false)} className="p-1.5 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white rounded-full transition-all">
              <X size={16} />
            </button>
          </div>

          {/* 검색창 생략 (기존과 동일) */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={14} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="닉네임 또는 이메일..."
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white outline-none focus:border-blue-500/50 transition-all"
            />
          </div>

          {/* 탭 전환 (기존과 동일) */}
          {searchQuery.length === 0 && (
            <div className="flex gap-1 p-1 bg-white/5 rounded-xl mb-6 relative">
              {(["FOLLOWING", "FOLLOWER"] as TabType[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="relative flex-1 py-2 text-[10px] font-black uppercase tracking-widest z-10"
                >
                  <span className={activeTab === tab ? "text-white" : "text-white/30"}>{tab}</span>
                  {activeTab === tab && (
                    <motion.div layoutId={isReady ? "activeTabBackground" : undefined} className="absolute inset-0 bg-white/10 rounded-lg -z-10" />
                  )}
                </button>
              ))}
            </div>
          )}

          {/* 콘텐츠 영역 */}
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={searchQuery.length > 0 ? "search" : activeTab}
                initial={{ opacity: 0, x: 5 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -5 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {searchQuery.length > 0 ?
                  searchResults.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-white/20">
                      <Ghost size={32} strokeWidth={1} className="mb-2" />
                      <p className="text-[13px] font-mono tracking-tighter">USER_NOT_FOUND</p>
                    </div>
                  ) : (
                    searchResults.map((user) => (
                      <UserItem
                        key={user.email}
                        user={user}
                        isSearch={true}
                        activeTab={activeTab}
                        isOnline={user.isOnline}
                        onActionSuccess={(email) => removeUserFromList(email, activeTab)}
                      />
                    ))
                  ) :
                  lists[activeTab].length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-white/20">
                      <Ghost size={32} strokeWidth={1} className="mb-2" />
                      <p className="text-[13px] font-mono tracking-tighter">USER_NOT_FOUND</p>
                    </div>
                  ) : (
                    lists[activeTab].map((friend) => (
                      <UserItem
                        key={friend.email}
                        user={friend}
                        isSearch={false}
                        activeTab={activeTab}
                        isOnline={friend.isOnline}
                        onActionSuccess={(email) => removeUserFromList(email, activeTab)}
                      />
                    ))
                  )}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default SocialPanel;