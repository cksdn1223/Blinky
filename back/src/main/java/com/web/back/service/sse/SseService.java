package com.web.back.service.sse;

import com.web.back.service.room.RoomService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class SseService {
    private final Map<String, SseEmitter> emitters = new ConcurrentHashMap<>();
    private final StringRedisTemplate redisTemplate;
    private final RoomService roomService;

    public SseEmitter subscribe(String email) {
        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);
        emitters.put(email, emitter);

        redisTemplate.opsForValue().set("status:" + email, "online", 45, TimeUnit.SECONDS);

        emitter.onCompletion(() -> cleanup(email));
        emitter.onTimeout(() -> cleanup(email));
        emitter.onError((e) -> cleanup(email));

        sendEvent(email, "connect", "Welcome!");
        return emitter;
    }

    public void sendEvent(String email, String name, Object data) {
        SseEmitter emitter = emitters.get(email);
        if (emitter != null) {
            try {
                emitter.send(SseEmitter.event().name(name).data(data));
            } catch (IOException | IllegalStateException e) {
                log.error("SSE 전송 중 오류 발생 (사용자: {}), 연결을 정리합니다.", email);
                cleanup(email);
            }
        }
    }

    @Scheduled(fixedDelay = 30000)
    public void broadcastHeartbeat() {
        emitters.keySet().parallelStream().forEach(email -> {
            try {
                sendEvent(email, "heartbeat", "ping");
                redisTemplate.expire("status:" + email, 45, TimeUnit.SECONDS);
            } catch (Exception e) {
                emitters.remove(email);
            }
        });
    }

    public void cleanup(String email) {
        emitters.remove(email);
        redisTemplate.delete("status:" + email);
        roomService.leaveRoom(email);
        log.info("Cleanup: 유저 {} 연결 종료 및 방 퇴장 처리", email);
    }

    public void broadcastToRoom(String ownerEmail, String eventName, Object data) {
        Set<String> members = roomService.getParticipants(ownerEmail);
        log.info("[Broadcast] Room: {}, Event: {}, Target Members Count: {}",
                ownerEmail, eventName, members.size());
        for (String memberEmail : members) {
            if (!memberEmail.equals(ownerEmail)) {
                sendEvent(memberEmail, eventName, data);
            }
        }
    }
}
