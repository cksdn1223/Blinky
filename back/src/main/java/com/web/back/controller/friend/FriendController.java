package com.web.back.controller.friend;

import com.web.back.service.friend.FriendService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/friend")
public class FriendController {
    private final FriendService friendService;

    @PostMapping
    public ResponseEntity<Void> toggleFollow(
            @RequestParam String email,
            Principal principal
    ) {
        friendService.toggleFollow(email, principal);
        return ResponseEntity.ok().build();
    }
}
