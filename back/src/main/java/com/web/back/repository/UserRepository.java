package com.web.back.repository;

import com.web.back.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(String email);

    List<User> findByNicknameContainingAndIdNot(String nickname, UUID userId);
    List<User> findByEmailContainingAndIdNot(String email, UUID userId);
}