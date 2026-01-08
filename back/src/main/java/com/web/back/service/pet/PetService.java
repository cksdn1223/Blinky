package com.web.back.service.pet;

import com.web.back.dto.pet.PetStatusResponseDto;
import com.web.back.entity.Pet;
import com.web.back.entity.User;
import com.web.back.repository.PetRepository;
import com.web.back.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.transaction.annotation.Transactional;
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
        User user = findByPrincipal(principal, "닉네임을 변경할 펫의 주인을 찾을 수 업습니다.");
        user.getPet().changeNickname(nickname);
    }

    @Transactional
    public PetStatusResponseDto interactWithPet(Principal principal) {
        User user = findByPrincipal(principal, "펫과의 상호작용 과정에서 해당 유저를 찾을 수 없습니다.");
        Pet pet = user.getPet();

        double currentBoredom = pet.getCalculatedBoredom();
        double nextBoredom = Math.max(currentBoredom - 30, 0);
        double nextHappiness = pet.getHappiness() + 1;
        pet.changeStatus(nextHappiness, nextBoredom);
        return PetStatusResponseDto.from(pet);
    }


    // 헬퍼 메서드
    public User findByPrincipal(Principal principal, String error) {
        return userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new EntityNotFoundException(error));
    }
}
