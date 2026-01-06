import { create } from 'zustand'
import { persist } from 'zustand/middleware';
import { AuthState, UserState } from '../types';
import { getUserStats } from '../api/api';

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
  }
}));