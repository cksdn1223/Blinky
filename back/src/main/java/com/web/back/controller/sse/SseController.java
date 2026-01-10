package com.web.back.controller.sse;

import com.web.back.service.sse.SseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
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
}
