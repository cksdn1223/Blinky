import { AnimatePresence, motion } from "framer-motion";
import { X, Search, Users } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { SearchUser } from "../types";
import { searchUser, getFollowers, getFollowings } from "../api/api"; // API 추가
import UserItem from "./UserItem";

type TabType = "FOLLOWING" | "FOLLOWER";

function SocialPanel({ isSocialOpen, setIsSocialOpen }: { isSocialOpen: boolean; setIsSocialOpen: (open: boolean) => void }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>("FOLLOWING"); // 탭 상태 추가
  const [isReady, setIsReady] = useState(false);

  const [lists, setLists] = useState<{ FOLLOWING: SearchUser[], FOLLOWER: SearchUser[] }>({
    FOLLOWING: [],
    FOLLOWER: []
  });

  // 팔로잉/팔로워 데이터 가져오기
  const fetchFriendsData = useCallback(async (tab: TabType) => {
    try {
      const data = tab === "FOLLOWING" ? await getFollowings() : await getFollowers();
      setLists(prev => ({ ...prev, [tab]: data }));
    } catch (error) {
      console.error("목록 불러오기 실패", error);
    }
  }, []);

  const removeUserFromList = useCallback((email: string, tab: TabType) => {
    setLists(prev => ({
      ...prev,
      [tab]: prev[tab].filter(user => user.email !== email)
    }));
  }, []);

  // 패널 열릴 때 초기화
  useEffect(() => {
    if (isSocialOpen) {
      if (!isReady) setSearchQuery("");
      if (lists[activeTab].length === 0) {
        fetchFriendsData(activeTab);
      }
      const interval = setInterval(() => fetchFriendsData(activeTab), 60000);
      return () => clearInterval(interval);
    }
  }, [isSocialOpen, activeTab, fetchFriendsData, lists, isReady]);


  // 검색 디바운싱
  useEffect(() => {
    const trimmed = searchQuery.trim();

    if (trimmed.length === 0 || trimmed === "@") {
      setSearchResults([]);
      if (trimmed.length === 0) fetchFriendsData(activeTab);
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
  }, [searchQuery, fetchFriendsData, activeTab]);

  useEffect(() => {
    if (isSocialOpen) {
      const timer = setTimeout(() => setIsReady(true), 250);
      return () => clearTimeout(timer);
    } else {
      setIsReady(false);
    }
  }, [isSocialOpen]);

  return (
    <AnimatePresence>
      {isSocialOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 10 }}
          transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
          className="absolute -right-16 top-0 w-[350px] h-[580px] bg-[#1a1c1e]/95 backdrop-contrast-150 border border-white/10 rounded-[1.5rem] px-7 py-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[100] origin-top-right flex flex-col"
        >
          {/* 헤더 */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
              <span className="text-white font-mono font-black text-[11px] uppercase tracking-[0.3em] opacity-70">Social</span>
            </div>
            <button
              onClick={() => setIsSocialOpen(false)}
              className="p-1.5 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white rounded-full transition-all"
            >
              <X size={16} />
            </button>
          </div>

          {/* 검색창 */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={14} />
            <input
              type="text"
              maxLength={20}
              value={searchQuery}
              onChange={(e) => {
                const value = e.target.value;
                setSearchQuery(value);
                if (value.trim().length === 0) {
                  setSearchResults([]);
                }
              }}
              placeholder="친구 닉네임 또는 이메일..."
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white outline-none focus:border-blue-500/50 transition-all placeholder:text-white/20"
            />
            {searchQuery.length > 0 && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-white/10">
                {searchQuery.length}/20
              </span>
            )}
          </div>

          {/* 탭 전환 버튼 (검색 중이 아닐 때만 노출) */}
          {searchQuery.length === 0 && (
            <div className="flex gap-1 p-1 bg-white/5 rounded-xl mb-6 relative">
              {(["FOLLOWING", "FOLLOWER"] as TabType[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="relative flex-1 py-2 text-[10px] font-black uppercase tracking-widest z-10 transition-colors"
                >
                  <span className={activeTab === tab ? "text-white" : "text-white/30"}>
                    {tab}
                  </span>
                  {activeTab === tab && (
                    <motion.div
                      layoutId={isReady ? "activeTabBackground" : undefined}
                      className="absolute inset-0 bg-white/10 rounded-lg -z-10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                    />
                  )}
                </button>
              ))}
            </div>
          )}

          {/* 콘텐츠 영역 */}
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={searchQuery.length > 0 ? "search-view" : activeTab}
                initial={{ opacity: 0, x: 5 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -5 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                layout={searchQuery.length > 0 ? false : true}
                className="space-y-4"
              >
                {searchQuery.length > 0 ? (
                  <>
                    <h3 className="text-[10px] font-black text-blue-500/80 uppercase tracking-widest px-1">Search Results</h3>
                    {searchResults.length > 0 ? (
                      searchResults.map((user) => (
                        <UserItem
                          key={user.email}
                          user={user}
                          isSearch={true}
                          activeTab={activeTab}
                          onActionSuccess={(email) => removeUserFromList(email, activeTab)}
                        />
                      ))
                    ) : (
                      <p className="text-center text-white/20 text-xs py-10">검색 결과가 없습니다.</p>
                    )}
                  </>
                ) : (
                  <>
                    <h3 className={`text-[10px] font-black uppercase tracking-widest px-1 ${activeTab === 'FOLLOWING' ? 'text-green-500/80' : 'text-purple-500/80'}`}>
                      {activeTab === "FOLLOWING" ? "Following" : "Followers"}
                    </h3>
                    {lists[activeTab].length > 0 ? (
                      lists[activeTab].map((friend) => (
                        <UserItem
                          key={friend.email}
                          user={friend}
                          isSearch={false}
                          activeTab={activeTab}
                          onActionSuccess={(email) => removeUserFromList(email, activeTab)}
                        />
                      ))
                    ) : (
                      <div className="text-center py-20 space-y-3">
                        <Users className="mx-auto text-white/5" size={40} />
                        <p className="text-white/20 text-xs">정보가 없습니다.</p>
                      </div>
                    )}
                  </>
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