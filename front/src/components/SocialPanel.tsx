import { AnimatePresence, motion } from "framer-motion";
import { X, Search, UserPlus, Users, UserCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { SearchUser } from "../types";
import { searchUser, toggleFollow, getFollowers, getFollowings } from "../api/api"; // API 추가

type TabType = "FOLLOWING" | "FOLLOWER";

function SocialPanel({ isSocialOpen, setIsSocialOpen }: { isSocialOpen: boolean; setIsSocialOpen: (open: boolean) => void }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [friends, setFriends] = useState<SearchUser[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>("FOLLOWING"); // 탭 상태 추가
  const [isSearching, setIsSearching] = useState(false);

  // 패널 열릴 때 초기화
  useEffect(() => {
    setSearchQuery("");
    if (isSocialOpen) fetchFriendsData();
  }, [isSocialOpen, activeTab,]); // 탭이 바뀌거나 열릴 때 데이터 로드

  // 팔로잉/팔로워 데이터 가져오기
  const fetchFriendsData = async () => {
    try {
      const data = activeTab === "FOLLOWING" ? await getFollowings() : await getFollowers();
      setFriends(data);
    } catch (error) {
      console.error("목록 불러오기 실패", error);
    }
  };

  // 검색 디바운싱
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const data = await searchUser(searchQuery);
        setSearchResults(data);
      } catch (error) {
        console.error("검색 실패", error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <AnimatePresence>
      {isSocialOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          className="absolute -right-16 top-0 w-[350px] h-[580px] bg-[#1a1c1e]/95 backdrop-blur-xl border border-white/10 rounded-[1.5rem] p-7 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[100] origin-top-right flex flex-col"
        >
          {/* 헤더 */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
              <span className="text-white font-mono font-black text-[11px] uppercase tracking-[0.3em] opacity-70">Social Hub</span>
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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="친구 닉네임 또는 이메일..."
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white outline-none focus:border-blue-500/50 transition-all placeholder:text-white/20"
            />
          </div>

          {/* 탭 전환 버튼 (검색 중이 아닐 때만 노출) */}
          {searchQuery.length === 0 && (
            <div className="flex gap-1 p-1 bg-white/5 rounded-xl mb-6">
              {(["FOLLOWING", "FOLLOWER"] as TabType[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === tab ? "bg-white/10 text-white" : "text-white/30 hover:text-white/50"
                    }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          )}

          {/* 콘텐츠 영역 */}
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {searchQuery.length > 0 ? (
              <div className="space-y-4">
                <h3 className="text-[10px] font-black text-blue-500/80 uppercase tracking-widest px-1">Search Results</h3>
                {searchResults.length > 0 ? (
                  searchResults.map((user) => (
                    <UserItem key={user.email} user={user} isSearch={true} onToggle={fetchFriendsData} />
                  ))
                ) : (
                  <p className="text-center text-white/20 text-xs py-10">검색 결과가 없습니다.</p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className={`text-[10px] font-black uppercase tracking-widest px-1 ${activeTab === 'FOLLOWING' ? 'text-green-500/80' : 'text-purple-500/80'}`}>
                  {activeTab === "FOLLOWING" ? "Following" : "Followers"}
                </h3>
                {friends.length > 0 ? (
                  friends.map((friend) => (
                    <UserItem key={friend.email} user={friend} isSearch={false} onToggle={fetchFriendsData} />
                  ))
                ) : (
                  <div className="text-center py-20 space-y-3">
                    <Users className="mx-auto text-white/5" size={40} />
                    <p className="text-white/20 text-xs">정보가 없습니다.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// 사용자 아이템 컴포넌트
function UserItem({ user, onToggle }: { user: SearchUser; isSearch: boolean; onToggle: () => void }) {
  const [localIsFollowing, setLocalIsFollowing] = useState(user.isFollowing);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    setLocalIsFollowing(user.isFollowing);
  }, [user.isFollowing]);

  const handleToggleFollow = async (email: string) => {
    if (isPending) return;
    setLocalIsFollowing(!localIsFollowing);
    setIsPending(true);
    try {
      await toggleFollow(email);
      onToggle();
    } catch (error) {
      setLocalIsFollowing(user.isFollowing);
      console.error("팔로우 토글 실패", error);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-white/10">
            <span className="text-xs font-bold text-white/50">{user.nickname[0].toUpperCase()}</span>
          </div>
          {/* 맞팔(Mutual) 상태면 작은 뱃지 표시 */}
          {user.isFollowing && user.isFollower && (
            <div className="absolute -right-1 -bottom-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#1a1c1e] flex items-center justify-center">
              <UserCheck size={8} className="text-white" />
            </div>
          )}
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-white">{user.nickname}</span>
            <span className="text-[10px] text-blue-400 font-mono opacity-60">{user.petName}</span>
          </div>
          <span className="text-[10px] text-white/30 font-mono">{user.email}</span>
        </div>
      </div>

      <button
        disabled={isPending} // 요청 중일 때는 비활성화
        className={`p-2 rounded-lg transition-all ${localIsFollowing // user.isFollowing 대신 로컬 상태 사용
            ? "text-blue-500 bg-blue-500/10"
            : "text-white/20 hover:text-white hover:bg-white/5"
          } ${isPending ? "opacity-50 cursor-not-allowed" : ""}`}
        onClick={() => handleToggleFollow(user.email)}
      >
        {localIsFollowing ? <UserCheck size={18} /> : <UserPlus size={18} />}
      </button>
    </div>
  );
}

export default SocialPanel;