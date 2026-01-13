package com.web.back.repository;

import com.web.back.entity.FocusLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;

public interface FocusLogRepository extends JpaRepository<FocusLog, Long> {
    void deleteByEndAtBefore(LocalDateTime cutoffDate);
}
