import { useEffect, useRef, useState } from 'react';
import { useAuthStore, useMusicStore, useRoomStore, useUserStore } from '../store/store';
import { EventSourcePolyfill, NativeEventSource } from 'event-source-polyfill';
import { joinRoom } from '../api/api';

export const useSse = () => {
  const email = useUserStore((state) => state.userStats?.email);
  const token = useAuthStore((state) => state.token);
  const eventSourceRef = useRef<EventSource | null>(null);

  const [reconnectCount, setReconnectCount] = useState(0);

  useEffect(() => {
    if (!email || !token) return;

    // SSE 연결
    const baseUrl = import.meta.env.VITE_BASE_URL;
    const EventSource = EventSourcePolyfill || NativeEventSource;

    console.log(`🔌 SSE 연결 시도... (횟수: ${reconnectCount})`);

    eventSourceRef.current = new EventSource(
      `${baseUrl}/api/connect/${email}`,
      {
        headers: {
          'Authorization': `Bearer ${token}` // 여기에 토큰 주입!
        },
        heartbeatTimeout: 120000 // 하트비트 제한 시간 설정 (옵션)
      }
    );
    const es = eventSourceRef.current;

    // 최초 연결 이벤트
    es.addEventListener('connect', (e) => {
      console.log('✅ SSE Connected:', e.data);
      const { currentRoomOwnerEmail } = useRoomStore.getState();
      if (currentRoomOwnerEmail) {
        console.log(`🔄 재연결 후 ${currentRoomOwnerEmail} 방에 다시 입장 시도...`);
        // joinRoom API 호출 로직 (예: axios.post /api/room/join ...)
        joinRoom(currentRoomOwnerEmail);
      }
    });

    // 하트비트 이벤트
    es.addEventListener('heartbeat', () => {
      console.log('💓 Heartbeat received');
    });

    es.addEventListener('music-sync', (e) => {
      const data = JSON.parse(e.data);

      const { currentRoomOwnerEmail } = useRoomStore.getState();
      const myEmail = useUserStore.getState().userStats?.email;

      // 내가 방장인 경우: 서버가 쏜 이벤트를 내가 다시 받을 필요 없음
      if (data.ownerEmail === myEmail) return;

      // 내가 현재 그 친구의 방에 접속해 있는 경우에만 동기화
      if (data.ownerEmail === currentRoomOwnerEmail) {
        useMusicStore.getState().syncMusic(data);
      }
    });

    // 에러 및 재연결 로직
    es.onerror = (error) => {
      console.error('❌ SSE Error:', error);
      es.close();
      // 재연결 시도
      if (email && token) {
        console.log('3초 후 SSE 재연결 시도');
        setTimeout(() => {
          setReconnectCount(prev => prev + 1);
        }, 3000);
      }
    };

    // 클린업: 언마운트 시 연결 종료
    return () => {
      console.log('🔌 SSE Disconnecting...');
      es.close();
      eventSourceRef.current = null;
    };
  }, [email, token, reconnectCount]);
};