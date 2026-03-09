package com.aiteam.backend.repository;

import com.aiteam.backend.entity.Issue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IssueRepository extends JpaRepository<Issue, Long> {

    List<Issue> findByProjectId(Long projectId);

    List<Issue> findByProjectIdAndIsArchivedFalse(Long projectId);

    List<Issue> findByProjectIdAndStatusId(Long projectId, Long statusId);

    List<Issue> findByProjectIdAndAssignedToId(Long projectId, Long assignedToId);

    List<Issue> findByProjectIdAndOwnerId(Long projectId, Long ownerId);

    @Query("SELECT i FROM Issue i WHERE i.projectId = :projectId AND i.isArchived = false AND i.isDeleted = false")
    List<Issue> findActiveByProjectId(@Param("projectId") Long projectId);

    @Query("SELECT COUNT(i) FROM Issue i WHERE i.projectId = :projectId")
    Long countByProjectId(@Param("projectId") Long projectId);

    @Query("SELECT COUNT(i) FROM Issue i WHERE i.projectId = :projectId AND i.statusId = :statusId")
    Long countByProjectIdAndStatusId(@Param("projectId") Long projectId, @Param("statusId") Long statusId);
}