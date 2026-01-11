import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware';
import { AuthState, MusicState, RoomState, SearchUser, SessionState, SocialState, UIState, UserState } from '../types';
import { getFollowers, getFollowings, getUserStats } from '../api/api';

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      setToken: (token) => set({ token }),
      logout: () => {
        set({ token: null });
        // 유저 정보 초기화
        useUserStore.setState({ userStats: null });
      },
    }),
    { name: 'auth-storage' } // localStorage에 자동 저장
  )
);

export const useUserStore = create<UserState>((set) => ({
  userStats: null,
  isLoading: false,
  fetchStats: async () => {
    set({ isLoading: true });
    try {
      const data = await getUserStats();
      set({ userStats: data, isLoading: false });
    } catch (error) {
      console.error("유저 정보 로드 실패: ", error);
      set({ isLoading: false });
    }
  },
  updateAfterSession: (totalTime: number, happiness: number, boredom: number) => {
    set((state) => ({
      userStats: state.userStats ? {
        ...state.userStats,
        totalFocusTime: totalTime, // 서버에서 준 새로운 누적 시간
        petHappiness: happiness,    // 방금 전송했던 그 수치 그대로 유지
        petBoredom: boredom
      } : null
    }));
  },
  updatePetStats: (happiness, boredom) => {
    set((state) => ({
      userStats: state.userStats ? { ...state.userStats, petHappiness: happiness, petBoredom: boredom } : null
    }));
  },
  updateNicknames: (userNickname?: string, petNickname?: string) => {
    set((state) => ({
      userStats: state.userStats ? {
        ...state.userStats,
        ...(userNickname && { nickname: userNickname }),
        ...(petNickname && { petNickname: petNickname }),
      } : null
    }));
  }
}));

export const useSessionStore = create<SessionState>((set, get) => ({
  sessionTime: 0,
  startTime: null,
  isPlaying: false,
  currentVideoIds: [],
  isEnding: false,

  setStartTime: (time) => set({ startTime: time }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  addVideoId: (id) => set((state) => ({
    currentVideoIds: state.currentVideoIds.includes(id)
      ? state.currentVideoIds
      : [...state.currentVideoIds, id]
  })),

  tick: () => {
    const { startTime } = get();
    if (!startTime) return;
    const now = new Date();
    const start = new Date(startTime);
    const diffInSecs = Math.floor((now.getTime() - start.getTime()) / 1000);
    if (diffInSecs >= 0) set({ sessionTime: diffInSecs });
  },

  resetSession: () => set({
    startTime: new Date().toISOString().split('.')[0],
    sessionTime: 0,
    currentVideoIds: []
  })
}));

export const useUIStore = create<UIState>((set) => ({
  isSettingsOpen: false,
  isSocialOpen: false,
  setSettingsOpen: (open) => set({ isSettingsOpen: open }),
  setSocialOpen: (open) => set({ isSocialOpen: open }),
  toggleSettings: () => set((state) => ({ isSettingsOpen: !state.isSettingsOpen })),
  toggleSocial: () => set((state) => ({ isSocialOpen: !state.isSocialOpen })),
}));

export const useSocialStore = create<SocialState>((set) => ({
  lists: {
    FOLLOWING: [],
    FOLLOWER: []
  },
  isLoading: false,
  // Social
  fetchFriendsList: async (tab: "FOLLOWING" | "FOLLOWER") => {
    set({ isLoading: true });
    try {
      const data = tab === "FOLLOWING" ? await getFollowings() : await getFollowers();
      set((state) => ({
        lists: { ...state.lists, [tab]: data }
      }));
    } catch (error) {
      console.error(`${tab} 목록 로드 실패:`, error);
    } finally {
      set({ isLoading: false });
    }
  },
  addFollowingToList: (user: SearchUser) => set((state) => {
    const isExist = state.lists.FOLLOWING.some(u => u.email === user.email);
    if (isExist) return state;

    return {
      lists: {
        ...state.lists,
        FOLLOWING: [user, ...state.lists.FOLLOWING] // 목록 맨 앞에 추가
      }
    };
  }),
  removeUserFromList: (email, tab) => set((state) => ({
    lists: {
      ...state.lists,
      [tab]: state.lists[tab].filter(u => u.email !== email)
    }
  })),
  /* --- 공통 초기화 --- */
  clearSocialData: () => set({
    lists: { FOLLOWING: [], FOLLOWER: [] }
  })
}));

export const useMusicStore = create<MusicState>()(
  persist(
    (set) => ({
      currentRoomMusic: null,
      syncMusic: (data) => set({
        currentRoomMusic: {
          videoId: data.videoId,
          isPlaying: data.playing,
          progressMs: data.progressMs,
          ownerEmail: data.ownerEmail
        }
      }),
      resetRoomMusic: () => set({ currentRoomMusic: null })
    }),
    {
      name: 'music-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export const useRoomStore = create<RoomState>()(
  persist(
    (set) => ({
      currentRoomOwnerEmail: null,
      setRoom: (email) => set({ currentRoomOwnerEmail: email }),
      leaveRoom: () => set({ currentRoomOwnerEmail: null }),
    }),
    {
      name: 'room-storage', // localStorage에 저장될 키 이름
      storage: createJSONStorage(() => localStorage), // (선택 사항) 기본값이 localStorage입니다.
    }
  )
);