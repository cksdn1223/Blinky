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
  isOnline: boolean;
  isMusicPlaying?: boolean;
  isRoomFull?: boolean;
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
  isRankOpen: boolean;
  setSettingsOpen: (open: boolean) => void;
  setSocialOpen: (open: boolean) => void;
  setRankOpen: (open: boolean) => void;
  toggleSettings: () => void;
  toggleSocial: () => void;
  toggleRank: () => void;
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
  fetchFriendsList: (tab: "FOLLOWING" | "FOLLOWER") => Promise<void>;
  addFollowingToList: (user: SearchUser) => void;
  removeUserFromList: (email: string, tab: "FOLLOWING" | "FOLLOWER") => void;
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

export type MusicState = {
  // 현재 방의 음악 상태
  currentRoomMusic: {
    videoId: string;
    isPlaying: boolean;
    progressMs: number;
    ownerEmail: string;
  } | null;

  // 서버에서 받은 데이터를 스토어에 업데이트
  syncMusic: (data: { videoId: string; playing: boolean; progressMs: number; ownerEmail: string }) => void;

  // 방에서 나갈 때 초기화
  resetRoomMusic: () => void;
}

export type RoomState = {
  currentRoomOwnerEmail: string | null;
  currentRoomOwnerNickname: string | null;
  setRoom: (email: string | null, nickname: string | null) => void;
  leaveRoom: () => void;
}

export type RankUser = {
  rank: number;
  nickname: string;
  totalFocusSec: number;
}

export type RankPanelProps = {
  isRankOpen: boolean;
  setIsRankOpen: (isOpen: boolean) => void;
}