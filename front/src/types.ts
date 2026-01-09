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
  uuid: string;
  email: string;
  nickname: string;
  totalFocusTime: number;
  role: string;
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
  updateNicknames: (userNickname?: string, petNickname?: string) => void;
}

export type SearchUser = {
  nickname: string;
  email: string;
  isFollowing: boolean;
  isFollower: boolean;
  petName: string;
  petHappiness: number;
  petBoredom: number;
};

export type SessionState = {
  sessionTime: number;
  startTime: string | null;
  isPlaying: boolean;
  currentVideoIds: string[];
  isEnding: boolean;

  setStartTime: (time: string) => void;
  setIsPlaying: (playing: boolean) => void;
  addVideoId: (id: string) => void;
  tick: () => void;
  resetSession: () => void;
}

export type UIState = {
  isSettingsOpen: boolean;
  isSocialOpen: boolean;
  setSettingsOpen: (open: boolean) => void;
  setSocialOpen: (open: boolean) => void;
  toggleSettings: () => void;
  toggleSocial: () => void;
}

export type FriendStatus = {
  email: string;
  nickname: string;
  // 현재 활동 상태
  music: {
    videoId: string;
    isPlaying: boolean;
    progressMs: number;
  } | null;
  pet: {
    nickname: string;
    status: string;    // 애니메이션 상태
    x: number;
    y: number;
  };
  lastSeen: number;
}

export type SocialState = {
  lists: {
    FOLLOWING: SearchUser[];
    FOLLOWER: SearchUser[];
  };
  isLoading: boolean;
  // Presence (실시간 데이터)
  friendStatus: Record<string, FriendStatus>;
  fetchFriendsList: (tab: "FOLLOWING" | "FOLLOWER") => Promise<void>;
  addFollowingToList: (user: SearchUser) => void;
  removeUserFromList: (email: string, tab: "FOLLOWING" | "FOLLOWER") => void;
  updateFriendStatus: (email: string, newData: Partial<FriendStatus>) => void;
  removeFriendFromShare: (email: string) => void;
  clearSocialData: () => void;
}

export type propTypes = {
  // 유저 관련
  userName: string;
  handleUserNickname: (nickname: string) => Promise<void>;

  // 펫 관련
  petName: string;
  handlePetNickname: (nickname: string) => Promise<void>;

  // 패널 제어
  setIsSettingsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isSettingsOpen: boolean;
};