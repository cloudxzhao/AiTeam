package com.aiteam.backend.repository;

import com.aiteam.backend.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {

    Optional<Project> findBySlug(String slug);

    List<Project> findByOwnerId(Long ownerId);

    @Query("SELECT p FROM Project p WHERE p.isArchived = false AND " +
           "(p.ownerId = :userId OR p.id IN " +
           "(SELECT pm.projectId FROM ProjectMember pm WHERE pm.userId = :userId))")
    List<Project> findAccessibleProjects(@Param("userId") Long userId);

    @Query("SELECT p FROM Project p WHERE p.isArchived = false AND p.isPrivate = false")
    List<Project> findPublicProjects();

    List<Project> findByIsArchivedFalse();
}