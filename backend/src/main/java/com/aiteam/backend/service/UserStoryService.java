package com.aiteam.backend.service;

import com.aiteam.backend.dto.UserStoryDTO;
import com.aiteam.backend.entity.KanbanStatus;
import com.aiteam.backend.entity.Project;
import com.aiteam.backend.entity.User;
import com.aiteam.backend.entity.UserStory;
import com.aiteam.backend.exception.ResourceNotFoundException;
import com.aiteam.backend.repository.KanbanStatusRepository;
import com.aiteam.backend.repository.ProjectRepository;
import com.aiteam.backend.repository.UserRepository;
import com.aiteam.backend.repository.UserStoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserStoryService {

    private final UserStoryRepository userStoryRepository;
    private final ProjectRepository projectRepository;
    private final KanbanStatusRepository kanbanStatusRepository;
    private final UserRepository userRepository;
    private final AuthService authService;

    public List<UserStoryDTO> getUserStories(Long projectId) {
        // Verify project exists
        projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("项目不存在"));

        List<UserStory> stories = userStoryRepository.findActiveByProjectId(projectId);

        return stories.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public UserStoryDTO getUserStory(Long id) {
        UserStory story = userStoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("用户故事不存在"));
        return toDTO(story);
    }

    @Transactional
    public UserStoryDTO createUserStory(Long projectId, UserStoryDTO dto) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("项目不存在"));

        User currentUser = authService.getCurrentUser();

        UserStory story = UserStory.builder()
                .projectId(projectId)
                .subject(dto.getSubject())
                .description(dto.getDescription())
                .statusId(dto.getStatus())
                .priorityId(dto.getPriority())
                .severityId(dto.getSeverity())
                .typeId(dto.getType())
                .points(dto.getPoints())
                .assignedToId(dto.getAssignedTo())
                .ownerId(currentUser.getId())
                .isArchived(false)
                .isDeleted(false)
                .build();

        story = userStoryRepository.save(story);

        // Update project story count
        project.setTotalStories(project.getTotalStories() + 1);
        projectRepository.save(project);

        return toDTO(story);
    }

    @Transactional
    public UserStoryDTO updateUserStory(Long id, UserStoryDTO dto) {
        UserStory story = userStoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("用户故事不存在"));

        if (dto.getSubject() != null) {
            story.setSubject(dto.getSubject());
        }
        if (dto.getDescription() != null) {
            story.setDescription(dto.getDescription());
        }
        if (dto.getStatus() != null) {
            story.setStatusId(dto.getStatus());
        }
        if (dto.getPriority() != null) {
            story.setPriorityId(dto.getPriority());
        }
        if (dto.getSeverity() != null) {
            story.setSeverityId(dto.getSeverity());
        }
        if (dto.getType() != null) {
            story.setTypeId(dto.getType());
        }
        if (dto.getPoints() != null) {
            story.setPoints(dto.getPoints());
        }
        if (dto.getAssignedTo() != null) {
            story.setAssignedToId(dto.getAssignedTo());
        }

        story = userStoryRepository.save(story);
        return toDTO(story);
    }

    @Transactional
    public void deleteUserStory(Long id) {
        UserStory story = userStoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("用户故事不存在"));

        // Soft delete
        story.setIsDeleted(true);
        userStoryRepository.save(story);
    }

    private UserStoryDTO toDTO(UserStory story) {
        UserStoryDTO dto = UserStoryDTO.builder()
                .id(story.getId())
                .project(story.getProjectId())
                .subject(story.getSubject())
                .description(story.getDescription())
                .status(story.getStatusId())
                .priority(story.getPriorityId())
                .severity(story.getSeverityId())
                .type(story.getTypeId())
                .points(story.getPoints())
                .assignedTo(story.getAssignedToId())
                .owner(story.getOwnerId())
                .isArchived(story.getIsArchived())
                .build();

        // Populate status name
        if (story.getStatusId() != null) {
            kanbanStatusRepository.findById(story.getStatusId())
                    .ifPresent(status -> dto.setStatusName(status.getName()));
        }

        // Populate assigned to name
        if (story.getAssignedToId() != null) {
            userRepository.findById(story.getAssignedToId())
                    .ifPresent(user -> dto.setAssignedToName(user.getFullName() != null ?
                            user.getFullName() : user.getUsername()));
        }

        // Populate owner name
        if (story.getOwnerId() != null) {
            userRepository.findById(story.getOwnerId())
                    .ifPresent(user -> dto.setOwnerName(user.getFullName() != null ?
                            user.getFullName() : user.getUsername()));
        }

        return dto;
    }
}