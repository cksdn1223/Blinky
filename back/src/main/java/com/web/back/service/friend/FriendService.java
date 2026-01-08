package com.web.back.service.friend;

import com.web.back.entity.User;
import com.web.back.repository.FriendRepository;
import com.web.back.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.security.Principal;

@Service
@RequiredArgsConstructor
public class FriendService {
    private final FriendRepository friendRepository;
    private final UserRepository userRepository;

    @Transactional
    public void toggleFollow(String email, Principal principal) {
        User targetUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("팔로우 하려는 유저를 찾을 수 없습니다."));
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new EntityNotFoundException("팔로우 과정에서 로그인중인 유저를 찾을 수 없습니다."));
        user.toggleFollow(targetUser);
    }
}
