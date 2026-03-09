package com.aiteam.backend.service;

import com.aiteam.backend.dto.ProjectDTO;
import com.aiteam.backend.entity.Project;
import com.aiteam.backend.entity.ProjectMember;
import com.aiteam.backend.entity.User;
import com.aiteam.backend.exception.BadRequestException;
import com.aiteam.backend.exception.ResourceNotFoundException;
import com.aiteam.backend.repository.ProjectMemberRepository;
import com.aiteam.backend.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final AuthService authService;

    public List<ProjectDTO> getProjects() {
        User currentUser = authService.getCurrentUser();
        List<Project> projects;

        if (currentUser.getIsSuperuser()) {
            projects = projectRepository.findByIsArchivedFalse();
        } else {
            projects = projectRepository.findAccessibleProjects(currentUser.getId());
        }

        return projects.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public ProjectDTO getProject(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("项目不存在"));

        User currentUser = authService.getCurrentUser();
        if (project.getIsPrivate() && !isUserProjectMemberOrOwner(project, currentUser.getId())) {
            throw new ResourceNotFoundException("项目不存在");
        }

        return toDTO(project);
    }

    @Transactional
    public ProjectDTO createProject(ProjectDTO dto) {
        User currentUser = authService.getCurrentUser();

        Project project = Project.builder()
                .name(dto.getName())
                .slug(generateSlug(dto.getName()))
                .description(dto.getDescription())
                .logo(dto.getLogo())
                .ownerId(currentUser.getId())
                .isPrivate(dto.getIsPrivate() != null ? dto.getIsPrivate() : false)
                .isArchived(false)
                .isBacklogActivated(dto.getIsBacklogActivated() != null ? dto.getIsBacklogActivated() : true)
                .isKanbanActivated(dto.getIsKanbanActivated() != null ? dto.getIsKanbanActivated() : true)
                .isWikiActivated(dto.getIsWikiActivated() != null ? dto.getIsWikiActivated() : true)
                .isIssuesActivated(dto.getIsIssuesActivated() != null ? dto.getIsIssuesActivated() : true)
                .totalMilestones(0)
                .totalStories(0)
                .totalTasks(0)
                .totalIssues(0)
                .build();

        project = projectRepository.save(project);

        // Add owner as project member
        ProjectMember member = ProjectMember.builder()
                .projectId(project.getId())
                .userId(currentUser.getId())
                .isOwner(true)
                .build();
        projectMemberRepository.save(member);

        return toDTO(project);
    }

    @Transactional
    public ProjectDTO updateProject(Long id, ProjectDTO dto) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("项目不存在"));

        if (dto.getName() != null) {
            project.setName(dto.getName());
            project.setSlug(generateSlug(dto.getName()));
        }
        if (dto.getDescription() != null) {
            project.setDescription(dto.getDescription());
        }
        if (dto.getLogo() != null) {
            project.setLogo(dto.getLogo());
        }
        if (dto.getIsPrivate() != null) {
            project.setIsPrivate(dto.getIsPrivate());
        }
        if (dto.getIsArchived() != null) {
            project.setIsArchived(dto.getIsArchived());
        }
        if (dto.getIsBacklogActivated() != null) {
            project.setIsBacklogActivated(dto.getIsBacklogActivated());
        }
        if (dto.getIsKanbanActivated() != null) {
            project.setIsKanbanActivated(dto.getIsKanbanActivated());
        }
        if (dto.getIsWikiActivated() != null) {
            project.setIsWikiActivated(dto.getIsWikiActivated());
        }
        if (dto.getIsIssuesActivated() != null) {
            project.setIsIssuesActivated(dto.getIsIssuesActivated());
        }

        project = projectRepository.save(project);
        return toDTO(project);
    }

    @Transactional
    public void deleteProject(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("项目不存在"));

        // Soft delete - archive instead
        project.setIsArchived(true);
        projectRepository.save(project);
    }

    private boolean isUserProjectMemberOrOwner(Project project, Long userId) {
        return project.getOwnerId().equals(userId) ||
                projectMemberRepository.existsByProjectIdAndUserId(project.getId(), userId);
    }

    private String generateSlug(String name) {
        return name.toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-");
    }

    private ProjectDTO toDTO(Project project) {
        return ProjectDTO.builder()
                .id(project.getId())
                .name(project.getName())
                .slug(project.getSlug())
                .description(project.getDescription())
                .logo(project.getLogo())
                .ownerId(project.getOwnerId())
                .isPrivate(project.getIsPrivate())
                .isArchived(project.getIsArchived())
                .isBacklogActivated(project.getIsBacklogActivated())
                .isKanbanActivated(project.getIsKanbanActivated())
                .isWikiActivated(project.getIsWikiActivated())
                .isIssuesActivated(project.getIsIssuesActivated())
                .totalMilestones(project.getTotalMilestones())
                .totalStories(project.getTotalStories())
                .totalTasks(project.getTotalTasks())
                .totalIssues(project.getTotalIssues())
                .build();
    }
}