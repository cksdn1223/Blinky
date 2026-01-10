package com.web.back.service.sse;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class SseService {
    private final Map<String, SseEmitter> emitters = new ConcurrentHashMap<>();
    private final StringRedisTemplate redisTemplate;

    public SseEmitter subscribe(String email) {
        SseEmitter emitter = new SseEmitter(10* 60 * 1000L);
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
            } catch (IOException e) {
                cleanup(email);
            }
        }
    }

    @Scheduled(fixedDelay = 30000)
    public void broadcastHeartbeat() {
        emitters.keySet().forEach(email -> {
            sendEvent(email, "heartbeat", "ping");
            redisTemplate.expire("status:" + email, 45, TimeUnit.SECONDS);
        });
    }

    public void cleanup(String email) {
        emitters.remove(email);
        redisTemplate.delete("status:" + email);
    }
}
