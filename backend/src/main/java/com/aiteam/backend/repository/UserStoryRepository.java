package com.aiteam.backend.repository;

import com.aiteam.backend.entity.UserStory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserStoryRepository extends JpaRepository<UserStory, Long> {

    List<UserStory> findByProjectId(Long projectId);

    List<UserStory> findByProjectIdAndIsArchivedFalse(Long projectId);

    List<UserStory> findByProjectIdAndStatusId(Long projectId, Long statusId);

    List<UserStory> findByProjectIdAndAssignedToId(Long projectId, Long assignedToId);

    List<UserStory> findByProjectIdAndOwnerId(Long projectId, Long ownerId);

    @Query("SELECT us FROM UserStory us WHERE us.projectId = :projectId AND us.isArchived = false AND us.isDeleted = false")
    List<UserStory> findActiveByProjectId(@Param("projectId") Long projectId);

    @Query("SELECT COUNT(us) FROM UserStory us WHERE us.projectId = :projectId")
    Long countByProjectId(@Param("projectId") Long projectId);

    @Query("SELECT COUNT(us) FROM UserStory us WHERE us.projectId = :projectId AND us.statusId = :statusId")
    Long countByProjectIdAndStatusId(@Param("projectId") Long projectId, @Param("statusId") Long statusId);
}