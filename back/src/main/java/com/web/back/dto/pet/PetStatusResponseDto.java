package com.web.back.dto.pet;

import com.web.back.entity.Pet;

public record PetStatusResponseDto(
        double happiness,
        double boredom
) {
    public static PetStatusResponseDto from(Pet pet) {
        return new PetStatusResponseDto(
                pet.getHappiness(),
                pet.getBoredom()
        );
    }
}
