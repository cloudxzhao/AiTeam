package com.aiteam.backend.repository;

import com.aiteam.backend.entity.AuditLog;
import com.aiteam.backend.entity.AuditLog.AuditAction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    Page<AuditLog> findByOperatorId(Long operatorId, Pageable pageable);

    Page<AuditLog> findByTargetUserId(Long targetUserId, Pageable pageable);

    Page<AuditLog> findByTargetProjectId(Long targetProjectId, Pageable pageable);

    Page<AuditLog> findByAction(AuditAction action, Pageable pageable);

    Page<AuditLog> findByResult(String result, Pageable pageable);

    @Query("SELECT al FROM AuditLog al WHERE al.createdAt BETWEEN :startTime AND :endTime")
    Page<AuditLog> findByTimeRange(LocalDateTime startTime, LocalDateTime endTime, Pageable pageable);

    List<AuditLog> findByTargetProjectIdAndAction(Long targetProjectId, AuditAction action);

    @Query("SELECT al FROM AuditLog al JOIN FETCH al.operator WHERE al.logId = :logId")
    AuditLog findByLogIdWithOperator(String logId);
}
