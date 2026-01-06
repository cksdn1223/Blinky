package com.web.back.service.pet;

import com.web.back.entity.User;
import com.web.back.repository.PetRepository;
import com.web.back.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.security.Principal;

@Service
@RequiredArgsConstructor
public class PetService {
    private final PetRepository petRepository;
    private final UserRepository userRepository;

    @Transactional
    public void changePetNickname(String nickname, Principal principal) {
        if (nickname == null || nickname.isBlank()) {
            throw new IllegalArgumentException("닉네임은 비어있을 수 없습니다.");
        }
        User user = userRepository.findByEmail(principal.getName())
                        .orElseThrow(() -> new EntityNotFoundException("닉네임을 변경할 펫의 주인을 찾을 수 업습니다."));
        user.getPet().changeNickname(nickname);
    }
}
