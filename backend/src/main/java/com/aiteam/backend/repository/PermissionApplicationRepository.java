package com.aiteam.backend.repository;

import com.aiteam.backend.entity.PermissionApplication;
import com.aiteam.backend.entity.PermissionApplication.ApplicationStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PermissionApplicationRepository extends JpaRepository<PermissionApplication, Long> {

    @EntityGraph(attributePaths = {"applicant", "project", "role"})
    List<PermissionApplication> findByApplicantId(Long applicantId);

    @EntityGraph(attributePaths = {"applicant", "project", "role"})
    List<PermissionApplication> findByApplicantIdAndStatus(Long applicantId, ApplicationStatus status);

    List<PermissionApplication> findByStatus(ApplicationStatus status);

    @Query("SELECT pa FROM PermissionApplication pa JOIN FETCH pa.applicant JOIN FETCH pa.project JOIN FETCH pa.role WHERE pa.status = 'PENDING'")
    List<PermissionApplication> findAllPendingWithDetails();

    @Query("SELECT pa FROM PermissionApplication pa JOIN FETCH pa.applicant JOIN FETCH pa.project JOIN FETCH pa.role WHERE pa.status = 'PENDING' AND pa.project.id = :projectId")
    List<PermissionApplication> findAllPendingByProjectId(Long projectId);

    @Query("SELECT pa FROM PermissionApplication pa WHERE pa.projectId = :projectId AND pa.applicantId = :applicantId AND pa.status = 'PENDING'")
    List<PermissionApplication> findPendingByProjectIdAndApplicantId(Long projectId, Long applicantId);

    List<PermissionApplication> findByApproverId(Long approverId);

    List<PermissionApplication> findByProjectIdAndStatus(Long projectId, ApplicationStatus status);
}
