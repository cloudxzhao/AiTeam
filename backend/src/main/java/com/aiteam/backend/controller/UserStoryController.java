package com.aiteam.backend.controller;

import com.aiteam.backend.dto.UserStoryDTO;
import com.aiteam.backend.service.UserStoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/userstories")
@RequiredArgsConstructor
public class UserStoryController {

    private final UserStoryService userStoryService;

    @GetMapping
    public ResponseEntity<List<UserStoryDTO>> getUserStories(@RequestParam Long project) {
        return ResponseEntity.ok(userStoryService.getUserStories(project));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserStoryDTO> getUserStory(@PathVariable Long id) {
        return ResponseEntity.ok(userStoryService.getUserStory(id));
    }

    @PostMapping
    public ResponseEntity<UserStoryDTO> createUserStory(@RequestBody UserStoryDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(userStoryService.createUserStory(dto.getProject(), dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserStoryDTO> updateUserStory(@PathVariable Long id, @RequestBody UserStoryDTO dto) {
        return ResponseEntity.ok(userStoryService.updateUserStory(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUserStory(@PathVariable Long id) {
        userStoryService.deleteUserStory(id);
        return ResponseEntity.noContent().build();
    }
}