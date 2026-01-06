package com.web.back.controller.pet;

import com.web.back.service.pet.PetService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/pet")
public class PetController {
    private final PetService petService;

    @PutMapping("/nickname")
    public ResponseEntity<Void> changePetNickname(
            @RequestParam String nickname,
            Principal principal
            ) {
        petService.changePetNickname(nickname, principal);
        return ResponseEntity.ok().build();
    }
}
