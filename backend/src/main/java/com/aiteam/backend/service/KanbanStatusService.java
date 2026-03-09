package com.aiteam.backend.service;

import com.aiteam.backend.dto.KanbanStatusDTO;
import com.aiteam.backend.entity.KanbanStatus;
import com.aiteam.backend.entity.Project;
import com.aiteam.backend.exception.BadRequestException;
import com.aiteam.backend.exception.ResourceNotFoundException;
import com.aiteam.backend.repository.KanbanStatusRepository;
import com.aiteam.backend.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class KanbanStatusService {

    private final KanbanStatusRepository kanbanStatusRepository;
    private final ProjectRepository projectRepository;

    public List<KanbanStatusDTO> getStatuses(Long projectId) {
        projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("项目不存在"));

        List<KanbanStatus> statuses = kanbanStatusRepository
                .findByProjectIdAndIsArchivedFalseOrderByPositionAsc(projectId);

        return statuses.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public KanbanStatusDTO createStatus(Long projectId, KanbanStatusDTO dto) {
        projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("项目不存在"));

        // Check if slug already exists
        String slug = generateSlug(dto.getName());
        if (kanbanStatusRepository.existsByProjectIdAndSlug(projectId, slug)) {
            throw new BadRequestException("状态名称已存在");
        }

        // Get max order
        List<KanbanStatus> existingStatuses = kanbanStatusRepository.findByProjectIdOrderByPositionAsc(projectId);
        int maxOrder = existingStatuses.stream()
                .mapToInt(KanbanStatus::getPosition)
                .max()
                .orElse(0);

        KanbanStatus status = KanbanStatus.builder()
                .projectId(projectId)
                .name(dto.getName())
                .slug(slug)
                .color(dto.getColor() != null ? dto.getColor() : "#6B7280")
                .position(maxOrder + 1)
                .isArchived(false)
                .isDeleted(false)
                .build();

        status = kanbanStatusRepository.save(status);
        return toDTO(status);
    }

    @Transactional
    public KanbanStatusDTO updateStatus(Long projectId, Long id, KanbanStatusDTO dto) {
        KanbanStatus status = kanbanStatusRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("状态不存在"));

        if (!status.getProjectId().equals(projectId)) {
            throw new BadRequestException("状态不属于该项目");
        }

        if (dto.getName() != null) {
            status.setName(dto.getName());
            status.setSlug(generateSlug(dto.getName()));
        }
        if (dto.getColor() != null) {
            status.setColor(dto.getColor());
        }
        if (dto.getPosition() != null) {
            status.setPosition(dto.getPosition());
        }
        if (dto.getIsArchived() != null) {
            status.setIsArchived(dto.getIsArchived());
        }

        status = kanbanStatusRepository.save(status);
        return toDTO(status);
    }

    @Transactional
    public void deleteStatus(Long projectId, Long id) {
        KanbanStatus status = kanbanStatusRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("状态不存在"));

        if (!status.getProjectId().equals(projectId)) {
            throw new BadRequestException("状态不属于该项目");
        }

        // Soft delete
        status.setIsDeleted(true);
        kanbanStatusRepository.save(status);
    }

    private String generateSlug(String name) {
        return name.toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-");
    }

    private KanbanStatusDTO toDTO(KanbanStatus status) {
        return KanbanStatusDTO.builder()
                .id(status.getId())
                .project(status.getProjectId())
                .name(status.getName())
                .slug(status.getSlug())
                .color(status.getColor())
                .position(status.getPosition())
                .isArchived(status.getIsArchived())
                .build();
    }
}