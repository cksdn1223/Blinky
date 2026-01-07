package com.web.back.controller.user;

import com.web.back.dto.user.UserResponseDto;
import com.web.back.entity.User;
import com.web.back.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/user")
public class UserController {
    private final UserService userService;

    @GetMapping("/stats")
    public ResponseEntity<UserResponseDto> getUserStats(
            @AuthenticationPrincipal User user
            ) {
        return ResponseEntity.ok(UserResponseDto.from(user));
    }

    @PutMapping("/nickname")
    public ResponseEntity<Void> changeNickname(
            @RequestParam String nickname,
            Principal principal
    ) {
        userService.changeNickname(nickname, principal);
        return ResponseEntity.ok().build();
    }
}
