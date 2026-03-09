package com.aiteam.backend.repository;

import com.aiteam.backend.entity.KanbanStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface KanbanStatusRepository extends JpaRepository<KanbanStatus, Long> {

    List<KanbanStatus> findByProjectIdOrderByPositionAsc(Long projectId);

    List<KanbanStatus> findByProjectIdAndIsArchivedFalseOrderByPositionAsc(Long projectId);

    Optional<KanbanStatus> findByProjectIdAndSlug(Long projectId, String slug);

    Optional<KanbanStatus> findByProjectIdAndName(Long projectId, String name);

    boolean existsByProjectIdAndSlug(Long projectId, String slug);

    void deleteByProjectIdAndId(Long projectId, Long statusId);
}