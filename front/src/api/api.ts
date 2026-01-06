import api from "./client";

export const sendEnd = async (startTime: string, videoIds: string[], petHappiness: number, petBoredom: number) => {
  const response = await api.post('/api/focus/end', {
    startAt: startTime,
    videoIds: videoIds,
    petHappiness: petHappiness,
    petBoredom: petBoredom
  });
  return response.data;
}

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