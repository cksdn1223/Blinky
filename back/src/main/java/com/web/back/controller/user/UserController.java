package com.web.back.controller.user;

import com.web.back.dto.user.UserRankResponseDto;
import com.web.back.dto.user.UserResponseDto;
import com.web.back.dto.user.UserSearchResponseDto;
import com.web.back.entity.User;
import com.web.back.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

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

    @GetMapping("/search")
    public ResponseEntity<List<UserSearchResponseDto>> searchUser(
            @RequestParam String nickname,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(userService.searchUser(nickname, user));
    }

    @GetMapping("following")
    public ResponseEntity<List<UserSearchResponseDto>> getFollowings(Principal principal) {
        return ResponseEntity.ok(userService.getFollowings(principal));
    }

    @GetMapping("follower")
    public ResponseEntity<List<UserSearchResponseDto>> getFollowers(Principal principal) {
        return ResponseEntity.ok(userService.getFollowers(principal));
    }

    @GetMapping("/rank")
    public ResponseEntity<UserRankResponseDto> getRanks(Principal principal) {
        return ResponseEntity.ok(userService.getRanks(principal));
    }

}
