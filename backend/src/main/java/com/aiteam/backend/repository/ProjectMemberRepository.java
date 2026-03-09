package com.aiteam.backend.repository;

import com.aiteam.backend.entity.ProjectMember;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectMemberRepository extends JpaRepository<ProjectMember, Long> {

    @EntityGraph(attributePaths = {"user", "role"})
    List<ProjectMember> findByProjectId(Long projectId);

    @EntityGraph(attributePaths = {"project", "role"})
    List<ProjectMember> findByUserId(Long userId);

    @EntityGraph(attributePaths = {"user", "role", "project"})
    Optional<ProjectMember> findByProjectIdAndUserId(Long projectId, Long userId);

    boolean existsByProjectIdAndUserId(Long projectId, Long userId);

    @Query("SELECT pm FROM ProjectMember pm JOIN FETCH pm.role r JOIN FETCH r.permissions WHERE pm.id = :id")
    Optional<ProjectMember> findByIdWithRoleAndPermissions(Long id);

    @Query("SELECT pm FROM ProjectMember pm JOIN FETCH pm.role r JOIN FETCH r.permissions WHERE pm.projectId = :projectId AND pm.userId = :userId")
    Optional<ProjectMember> findByProjectIdAndUserIdWithPermissions(Long projectId, Long userId);

    void deleteByProjectIdAndUserId(Long projectId, Long userId);

    List<ProjectMember> findByProjectIdAndRoleId(Long projectId, Long roleId);

    @Query("SELECT pm FROM ProjectMember pm WHERE pm.projectId = :projectId AND pm.userId = :userId AND pm.roleId = :roleId")
    Optional<ProjectMember> findByProjectIdAndUserIdAndRoleId(
            Long projectId,
            Long userId,
            Long roleId);
}
