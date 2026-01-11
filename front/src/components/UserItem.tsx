import { motion } from "framer-motion";
import { Heart, HeartHandshake, X, UserCheck, UserPlus, LogIn } from "lucide-react";
import { useState } from "react";
import { blockFollower, joinRoom, toggleFollow } from "../api/api";
import { SearchUser } from "../types";
import { useRoomStore, useSocialStore } from "../store/store";

// 사용자 아이템 컴포넌트
function UserItem({
  user,
  isSearch,
  activeTab,
  isOnline,
  onActionSuccess
}: {
  user: SearchUser;
  isSearch: boolean;
  activeTab: string;
  isOnline: boolean;
  onActionSuccess: (email: string) => void;
}) {
  const { addFollowingToList, removeUserFromList } = useSocialStore();
  const { setRoom } = useRoomStore();

  const [localIsFollowing, setLocalIsFollowing] = useState(user.isFollowing);
  const [isPending, setIsPending] = useState(false);

  const happiness = isNaN(user.petHappiness) ? 0 : Math.floor(user.petHappiness);
  const boredom = isNaN(user.petBoredom) ? 0 : Math.min(100, Math.floor(user.petBoredom));

  const handleAction = async (email: string) => {
    if (isPending) return;

    // 차단 로직 (검색 중이 아니고 팔로워 탭일 때)
    if (!isSearch && activeTab === 'FOLLOWER') {
      if (window.confirm(`${user.nickname}님을 차단하시겠습니까?`)) {
        try {
          setIsPending(true);
          await blockFollower(email);
          onActionSuccess(email); // 리스트에서 제거
        } catch (error) {
          console.error("차단 실패", error);
        } finally {
          setIsPending(false);
        }
      }
      return;
    }

    // 팔로우 토글 로직
    const nextFollowingState = !localIsFollowing;
    setLocalIsFollowing(nextFollowingState);
    setIsPending(true);

    try {
      await toggleFollow(email);

      if (nextFollowingState) {
        addFollowingToList({
          ...user,
          isFollowing: true
        });
      } else {
        removeUserFromList(email, 'FOLLOWING');
        if (!isSearch && activeTab === 'FOLLOWING') {
          onActionSuccess(email);
        }
      }
    } catch (error) {
      // 실패 시 UI 복구
      setLocalIsFollowing(!nextFollowingState);
      console.error("토글 실패", error);
    } finally {
      setIsPending(false);
    }
  };

  const handleJoin = async (email: string) => {
    try {
      await joinRoom(email);
      setRoom(email);
    } catch (error) {
      console.error("방 입장 실패: ", error);
    }
  }

  const getHappinessColor = (val: number) => {
    if (val > 5000) return "text-yellow-400 border-yellow-500/50 shadow-[0_0_10px_rgba(234,179,8,0.3)]";
    if (val > 1000) return "text-purple-400 border-purple-500/50";
    if (val > 500) return "text-blue-400 border-blue-500/50";
    return "text-green-400 border-green-500/50";
  };

  const happyStyle = getHappinessColor(happiness);

  return (
    <div className={`flex flex-col gap-3 rounded-[1.5rem] bg-[#1a1c1e]/15 border border-white/5 transition-all group relative overflow-hidden ${isSearch ? "p-3.5 hover:bg-white/7 hover:bg-white/5 hover:border-white/10" : "p-4 hover:bg-white/5 hover:border-white/10"
      }`}>
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">

          {/* 애정도  */}
          <div className={`w-11 h-11 rounded-full border-2 flex flex-col items-center justify-center bg-white/5 transition-all duration-500 ${happyStyle}`}>
            <Heart size={10} className="mb-0.5 opacity-80" />
            <span className="text-[12px] font-black leading-none tracking-tighter">
              {happiness > 999 ? `${(happiness / 1000).toFixed(1)}k` : happiness}
            </span>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-[15px] font-black text-white">{user.nickname}</span>
              {isOnline && (
                <span className="w-3 h-3 bg-green-500 rounded-full border-2 border-[#1a1c1e] shadow-[0_0_8px_#22c55e]" />
              )}
              {/* 맞팔 아이콘  */}
              {user.isFollowing && user.isFollower && (
                <div className="flex items-center justify-center p-1 bg-pink-500/10 text-pink-400 rounded-full border border-pink-500/20">
                  <HeartHandshake size={12} />
                </div>
              )}
            </div>
            {/* 이메일과 펫 이름  */}
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[11px] text-white/30 font-mono tracking-tight truncate max-w-[120px]">{user.email}</span>
            </div>
          </div>
        </div>
        {isOnline && activeTab === `FOLLOWING` &&
          <button
            onClick={() => handleJoin(user.email)}
            className="p-2 ml-0.5 rounded-xl transition-all outline-none focus:outline-none text-blue-400 hover:text-blue-300"
          >
            <LogIn size={18} />
          </button>}
        {/* 액션 버튼 */}
        <button
          disabled={isPending}
          onClick={() => handleAction(user.email)}
          className={`p-2 rounded-xl transition-all outline-none focus:outline-none ${!isSearch && activeTab === 'FOLLOWER'
            ? "text-red-500/40 hover:text-red-500 hover:bg-red-500/10"
            : localIsFollowing
              ? "text-blue-400 hover:text-blue-300"
              : "text-white/20 hover:text-white"
            }`}
        >
          {!isSearch && activeTab === 'FOLLOWER' ? <X size={18} /> : localIsFollowing ? <UserCheck size={18} /> : <UserPlus size={18} />}
        </button>
      </div>

      {/* 펫 상태 상세 정보 */}
      {!isSearch && (
        <div className="pt-3 border-t border-white/5 space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${boredom > 80 ? 'bg-red-500 animate-ping' : 'bg-green-500'}`} />
              <span className="text-[12px] font-black text-white/80">{user.petName}</span>
            </div>
            <span className={`text-[10px] font-mono font-bold ${boredom > 70 ? 'text-orange-500' : 'text-white/20'}`}>
              {boredom === 100 ? 'ASLEEP' : `BOREDOM: ${boredom}%`}
            </span>
          </div>

          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${boredom}%` }}
              className={`h-full transition-colors duration-500 ${boredom > 80 ? 'bg-red-500' : boredom > 50 ? 'bg-orange-500' : 'bg-blue-500/40'
                }`}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default UserItem;