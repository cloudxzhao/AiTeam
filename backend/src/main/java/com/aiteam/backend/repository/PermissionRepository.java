package com.aiteam.backend.repository;

import com.aiteam.backend.entity.Permission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PermissionRepository extends JpaRepository<Permission, Long> {

    Optional<Permission> findByCodename(String codename);

    List<Permission> findByModule(String module);

    List<Permission> findByIsActiveTrue();

    @Query("SELECT p FROM Permission p WHERE p.codename IN :codenames")
    List<Permission> findByCodenames(List<String> codenames);
}
