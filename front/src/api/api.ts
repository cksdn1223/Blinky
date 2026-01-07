import api from "./client";

export const sendEnd = async (
  startTime: string,
  videoIds: string[],
  happiness: number,
  boredom: number,
  token: string | null,
) => {
  const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/focus/end`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      startAt: startTime,
      videoIds,
      petHappiness: happiness,
      petBoredom: boredom
    }),
    keepalive: true
  });
  return response.json();
};

export const getUserStats = async () => {
  const response = await api.get("/api/user/stats");
  return response.data;
}

export const changePetNickname = async (nickname: string) => {
  await api.put("/api/pet/nickname", null, {
    params: {
      nickname: nickname
    }
  })
}

export const interactPet = async () => {
  const response = await api.post('/api/pet/interact');
  return response.data;
}

export const changeUserNickname = async (nickname: string) => {
  await api.put('/api/user/nickname', null, {
    params: {
      nickname: nickname
    }
  })
}