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
  onTick?: () => void;
  setIsPlaying?: (playing: boolean) => void;
}