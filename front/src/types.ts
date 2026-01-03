import { AxiosRequestConfig } from "axios";

export type PetStatus = {
  happiness: number;
  boredom: number;
}

export type PlaylistItem = {
  id: string;
  title: string;
  url: string;
}

export type YouTubePlayerProps = {
  className?: string;
  setIsPlaying?: (playing: boolean) => void;
  onVideoChange?: (videoId: string) => void;
}

export type AuthState = {
  token: string | null;
  setToken: (token: string) => void;
  logout: () => void;
}

export type ApiRequestConfig = AxiosRequestConfig & {
  skipAuthLogout?: boolean;
};

export type UserStats = {
  email: string;
  nickname: string;
  totalFocusTime: number;
  petNickname: string;
  petHappiness: number;
  petBoredom: number;
}

export type UserState = {
  userStats: UserStats | null;
  isLoading: boolean;
  fetchStats: () => Promise<void>;
  updateAfterSession: (totalTime: number, happiness: number, boredom: number) => void;
  updatePetStats: (happiness: number, boredom: number) => void;
}
