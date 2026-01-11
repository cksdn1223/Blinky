package com.web.back.controller.sse;

import com.web.back.dto.share.MusicDto;
import com.web.back.service.sse.SseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class SseController {
    private final SseService sseService;

    @GetMapping(value = "/connect/{email}", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter connect(@PathVariable String email) {
        return sseService.subscribe(email);
    }

    @PostMapping("/share/{ownerEmail}")
    public ResponseEntity<?> shareMusic(
            @PathVariable String ownerEmail,
            @RequestBody MusicDto musicDto
    ) {
        sseService.broadcastToRoom(ownerEmail, "music-sync", musicDto);
        return ResponseEntity.ok().build();
    }
}
