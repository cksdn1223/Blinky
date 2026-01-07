package com.web.back.service;

import com.web.back.entity.User;
import com.web.back.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.security.Principal;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;

    @Transactional
    public void changeNickname(String nickname, Principal principal) {
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new EntityNotFoundException("닉네임을 변경하는 과정에서 해당 유저를 찾을 수 없습니다."));
        user.changeNickname(nickname);
    }
}
