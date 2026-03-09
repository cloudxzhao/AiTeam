package com.aiteam.backend.config;

import com.aiteam.backend.entity.Role;
import com.aiteam.backend.entity.User;
import com.aiteam.backend.repository.RoleRepository;
import com.aiteam.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;

/**
 * 数据初始化器
 * 系统启动时自动创建管理员账户和默认角色
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    // 默认管理员账户配置
    private static final String ADMIN_USERNAME = "admin";
    private static final String ADMIN_PASSWORD = "admin123";
    private static final String ADMIN_EMAIL = "admin@aiteam.com";
    private static final String ADMIN_FULL_NAME = "系统管理员";

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        log.info("开始初始化系统数据...");

        initRoles();
        initAdminUser();

        log.info("系统数据初始化完成");
    }

    /**
     * 初始化默认角色
     */
    private void initRoles() {
        // 创建超级管理员角色
        if (!roleRepository.existsByName("超级管理员")) {
            Role superAdminRole = Role.builder()
                    .name("超级管理员")
                    .description("系统超级管理员，拥有所有权限")
                    .isAdmin(true)
                    .isSystem(true)
                    .build();
            roleRepository.save(superAdminRole);
            log.info("创建角色: 超级管理员");
        }

        // 创建项目管理员角色
        if (!roleRepository.existsByName("项目管理员")) {
            Role projectAdminRole = Role.builder()
                    .name("项目管理员")
                    .description("项目管理员，可以管理项目成员和设置")
                    .isAdmin(false)
                    .isSystem(true)
                    .build();
            roleRepository.save(projectAdminRole);
            log.info("创建角色: 项目管理员");
        }

        // 创建开发者角色
        if (!roleRepository.existsByName("开发者")) {
            Role developerRole = Role.builder()
                    .name("开发者")
                    .description("开发者，可以创建和编辑项目内容")
                    .isAdmin(false)
                    .isSystem(true)
                    .build();
            roleRepository.save(developerRole);
            log.info("创建角色: 开发者");
        }

        // 创建查看者角色
        if (!roleRepository.existsByName("查看者")) {
            Role viewerRole = Role.builder()
                    .name("查看者")
                    .description("查看者，只能查看项目内容")
                    .isAdmin(false)
                    .isSystem(true)
                    .build();
            roleRepository.save(viewerRole);
            log.info("创建角色: 查看者");
        }
    }

    /**
     * 初始化管理员账户
     */
    private void initAdminUser() {
        // 检查 admin 用户是否已存在
        if (userRepository.findByUsername(ADMIN_USERNAME).isPresent()) {
            log.info("管理员账户已存在，跳过创建");
            return;
        }

        // 获取超级管理员角色
        Role superAdminRole = roleRepository.findByName("超级管理员")
                .orElseGet(() -> {
                    Role role = Role.builder()
                            .name("超级管理员")
                            .description("系统超级管理员，拥有所有权限")
                            .isAdmin(true)
                            .isSystem(true)
                            .build();
                    return roleRepository.save(role);
                });

        // 创建管理员用户
        Set<Role> roles = new HashSet<>();
        roles.add(superAdminRole);

        User adminUser = User.builder()
                .username(ADMIN_USERNAME)
                .password(passwordEncoder.encode(ADMIN_PASSWORD))
                .email(ADMIN_EMAIL)
                .fullName(ADMIN_FULL_NAME)
                .isActive(true)
                .isSuperuser(true)
                .roles(roles)
                .build();

        userRepository.save(adminUser);

        log.info("==========================================");
        log.info("管理员账户创建成功!");
        log.info("用户名: {}", ADMIN_USERNAME);
        log.info("密码: {}", ADMIN_PASSWORD);
        log.info("邮箱: {}", ADMIN_EMAIL);
        log.info("请在登录后及时修改密码!");
        log.info("==========================================");
    }
}