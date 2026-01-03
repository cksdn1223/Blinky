package com.web.back.controller.focus;

import com.web.back.dto.focus.FocusRequestDto;
import com.web.back.dto.focus.FocusResponseDto;
import com.web.back.entity.User;
import com.web.back.service.FocusService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/focus")
@RequiredArgsConstructor
public class FocusController {
    private final FocusService focusService;

    @PostMapping("/end")
    public ResponseEntity<FocusResponseDto> endSession(
            @AuthenticationPrincipal User user,
            @RequestBody FocusRequestDto request
            ) {
        return ResponseEntity.ok(focusService.finishSession(user, request));
    }
}
