import { useEffect, useRef } from 'react';
import { useAuthStore, useSocialStore, useUserStore } from '../store/store';
import { EventSourcePolyfill, NativeEventSource } from 'event-source-polyfill';

export const useSse = () => {
  const email = useUserStore((state) => state.userStats?.email);
  const token = useAuthStore((state) => state.token);
  const { updateFriendStatus, removeFriendFromShare } = useSocialStore();
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!email || !token) return;

    // SSE 연결
    const baseUrl = import.meta.env.VITE_BASE_URL;
    const EventSource = EventSourcePolyfill || NativeEventSource;

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
    });

    // 하트비트 이벤트
    es.addEventListener('heartbeat', () => {
      console.log('💓 Heartbeat received');
    });

    // 에러 및 재연결 로직
    es.onerror = (error) => {
      console.error('❌ SSE Error:', error);
      es.close();
      // 일정 시간 후 재연결 시도 (선택 사항)
    };

    // 클린업: 언마운트 시 연결 종료
    return () => {
      console.log('🔌 SSE Disconnecting...');
      es.close();
      eventSourceRef.current = null;
    };
  }, [email, token, updateFriendStatus, removeFriendFromShare]);
};