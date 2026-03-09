package com.aiteam.backend.service;

import com.aiteam.backend.dto.IssueDTO;
import com.aiteam.backend.entity.Issue;
import com.aiteam.backend.entity.Project;
import com.aiteam.backend.entity.User;
import com.aiteam.backend.exception.ResourceNotFoundException;
import com.aiteam.backend.repository.IssueRepository;
import com.aiteam.backend.repository.KanbanStatusRepository;
import com.aiteam.backend.repository.ProjectRepository;
import com.aiteam.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class IssueService {

    private final IssueRepository issueRepository;
    private final ProjectRepository projectRepository;
    private final KanbanStatusRepository kanbanStatusRepository;
    private final UserRepository userRepository;
    private final AuthService authService;

    public List<IssueDTO> getIssues(Long projectId) {
        projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("项目不存在"));

        List<Issue> issues = issueRepository.findActiveByProjectId(projectId);

        return issues.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public IssueDTO getIssue(Long id) {
        Issue issue = issueRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("问题不存在"));
        return toDTO(issue);
    }

    @Transactional
    public IssueDTO createIssue(Long projectId, IssueDTO dto) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("项目不存在"));

        User currentUser = authService.getCurrentUser();

        Issue issue = Issue.builder()
                .projectId(projectId)
                .subject(dto.getSubject())
                .description(dto.getDescription())
                .statusId(dto.getStatus())
                .priorityId(dto.getPriority())
                .severityId(dto.getSeverity())
                .typeId(dto.getType())
                .assignedToId(dto.getAssignedTo())
                .ownerId(currentUser.getId())
                .isArchived(false)
                .isDeleted(false)
                .build();

        issue = issueRepository.save(issue);

        // Update project issue count
        project.setTotalIssues(project.getTotalIssues() + 1);
        projectRepository.save(project);

        return toDTO(issue);
    }

    @Transactional
    public IssueDTO updateIssue(Long id, IssueDTO dto) {
        Issue issue = issueRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("问题不存在"));

        if (dto.getSubject() != null) {
            issue.setSubject(dto.getSubject());
        }
        if (dto.getDescription() != null) {
            issue.setDescription(dto.getDescription());
        }
        if (dto.getStatus() != null) {
            issue.setStatusId(dto.getStatus());
        }
        if (dto.getPriority() != null) {
            issue.setPriorityId(dto.getPriority());
        }
        if (dto.getSeverity() != null) {
            issue.setSeverityId(dto.getSeverity());
        }
        if (dto.getType() != null) {
            issue.setTypeId(dto.getType());
        }
        if (dto.getAssignedTo() != null) {
            issue.setAssignedToId(dto.getAssignedTo());
        }

        issue = issueRepository.save(issue);
        return toDTO(issue);
    }

    @Transactional
    public void deleteIssue(Long id) {
        Issue issue = issueRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("问题不存在"));

        issue.setIsDeleted(true);
        issueRepository.save(issue);
    }

    private IssueDTO toDTO(Issue issue) {
        IssueDTO dto = IssueDTO.builder()
                .id(issue.getId())
                .project(issue.getProjectId())
                .subject(issue.getSubject())
                .description(issue.getDescription())
                .status(issue.getStatusId())
                .priority(issue.getPriorityId())
                .severity(issue.getSeverityId())
                .type(issue.getTypeId())
                .assignedTo(issue.getAssignedToId())
                .owner(issue.getOwnerId())
                .isArchived(issue.getIsArchived())
                .build();

        if (issue.getStatusId() != null) {
            kanbanStatusRepository.findById(issue.getStatusId())
                    .ifPresent(status -> dto.setStatusName(status.getName()));
        }

        if (issue.getAssignedToId() != null) {
            userRepository.findById(issue.getAssignedToId())
                    .ifPresent(user -> dto.setAssignedToName(user.getFullName() != null ?
                            user.getFullName() : user.getUsername()));
        }

        if (issue.getOwnerId() != null) {
            userRepository.findById(issue.getOwnerId())
                    .ifPresent(user -> dto.setOwnerName(user.getFullName() != null ?
                            user.getFullName() : user.getUsername()));
        }

        return dto;
    }
}