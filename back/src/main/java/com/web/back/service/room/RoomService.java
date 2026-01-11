package com.web.back.service.room;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.web.back.dto.share.MusicDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.Set;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class RoomService {
    private final RedisTemplate<String, String> redisTemplate;
    private final ObjectMapper objectMapper;

    private static final int MAX_PARTICIPANTS = 10;

    public boolean joinRoom(String ownerEmail, String guestEmail) {
        String roomKey = "room:" + ownerEmail;
        String locationKey = "user:location:" + guestEmail;

        // 이미 이 방에 있는지 확인 (중복 입장 방지)
        Boolean isAlreadyIn = redisTemplate.opsForSet().isMember(roomKey, guestEmail);
        if (Boolean.TRUE.equals(isAlreadyIn)) {
            log.info("이미 방에 참여 중입니다: {}", guestEmail);
            return true;
        }

        // 인원수 체크
        Long currentCount = redisTemplate.opsForSet().size(roomKey);
        if (currentCount != null && currentCount >= MAX_PARTICIPANTS) {
            log.warn("방 인원 초과: {}", ownerEmail);
            return false;
        }

        // 방에 참여자 추가 및 위치정보 기록
        redisTemplate.opsForSet().add(roomKey, guestEmail);
        redisTemplate.opsForValue().set(locationKey, ownerEmail);

        log.info("유저 [{}] 가 [{}] 의 방에 입장했습니다. (현재 인원: {})",
                guestEmail, ownerEmail, (currentCount != null ? currentCount + 1 : 1));
        return true;
    }

    public void leaveRoom(String guestEmail) {
        String locationKey = "user:location:" + guestEmail;
        String ownerEmail = redisTemplate.opsForValue().get(locationKey);

        if (ownerEmail != null) {
            redisTemplate.opsForSet().remove("room:" + ownerEmail, guestEmail);
            redisTemplate.delete(locationKey);
            log.info("유저 [{}] 가 [{}] 의 방에서 퇴장했습니다.", guestEmail, ownerEmail);
        }
    }

    public void updateCurrentMusic(String ownerEmail, MusicDto musicDto) {
        String key = "room:music:" + ownerEmail;
        try {
            String json = objectMapper.writeValueAsString(musicDto);
            redisTemplate.opsForValue().set(key, json, 5, TimeUnit.SECONDS);
        } catch (Exception e) {
            log.error("음악 정보 저장 실패", e);
        }
    }

    public MusicDto getRoomCurrentMusic(String ownerEmail) {
        String key = "room:music:" + ownerEmail;
        String json = redisTemplate.opsForValue().get(key);

        if (json != null) {
            try {
                return objectMapper.readValue(json, MusicDto.class);
            } catch (Exception e) {
                log.error("음악 정보 파싱 실패", e);
            }
        }
        return null; // 재생 중인 음악이 없음
    }

    public Set<String> getParticipants(String ownerEmail) {
        return redisTemplate.opsForSet().members("room:" + ownerEmail);
    }
}
