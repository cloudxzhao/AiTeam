package com.aiteam.backend.repository;

import com.aiteam.backend.entity.Role;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {

    Optional<Role> findBySlug(String slug);

    @EntityGraph(attributePaths = {"permissions"})
    @Query("SELECT r FROM Role r WHERE r.slug = :slug")
    Optional<Role> findBySlugWithPermissions(String slug);

    @EntityGraph(attributePaths = {"permissions"})
    @Query("SELECT r FROM Role r WHERE r.isSystem = true")
    List<Role> findAllByIsSystemTrue();

    List<Role> findByIsAdminTrue();

    @Query("SELECT r FROM Role r JOIN r.permissions p WHERE p.codename = :permissionCodename")
    List<Role> findByPermissionCodename(String permissionCodename);

    Optional<Role> findByName(String name);

    boolean existsByName(String name);

    boolean existsBySlug(String slug);
}
