package com.web.back.controller.room;

import com.web.back.dto.share.MusicDto;
import com.web.back.service.room.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/room")
public class RoomController {
    private final RoomService roomService;

    @PostMapping("/join/{ownerEmail}")
    public ResponseEntity<?> join(
            @PathVariable String ownerEmail,
            Principal principal
    ) {
        String guestEmail = principal.getName();
        boolean success = roomService.joinRoom(ownerEmail, guestEmail);

        if (success) {
            MusicDto currentMusic = roomService.getRoomCurrentMusic(ownerEmail);
            if (currentMusic != null && !currentMusic.isPlaying()) {
                currentMusic = null;
            }
            return ResponseEntity.ok(Map.of(
                    "message", "방에 입장했습니다.",
                    "currentMusic", currentMusic != null ? currentMusic : "FIRST_STATE"
            ));
        } else return ResponseEntity.status(HttpStatus.FORBIDDEN).body("방이 꽉 찼거나 입장할 수 없습니다.");
    }

    @PostMapping("/leave")
    public ResponseEntity<?> leave(
            Principal principal
    ) {
        roomService.leaveRoom(principal.getName());
        return ResponseEntity.ok("방에서 퇴장했습니다.");
    }
}
