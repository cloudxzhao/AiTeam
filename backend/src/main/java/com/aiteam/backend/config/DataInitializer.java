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
     * 角色由 Flyway 迁移脚本 V2 和 V3 创建，此处仅做检查
     */
    private void initRoles() {
        // 角色由 Flyway 迁移脚本创建，此处仅检查是否存在
        if (!roleRepository.existsBySlug("architect")) {
            log.warn("未找到架构师角色，请检查 Flyway 迁移是否执行");
        }
        if (!roleRepository.existsBySlug("validator")) {
            log.warn("未找到验证员角色，请检查 Flyway 迁移是否执行");
        }
        if (!roleRepository.existsBySlug("builder")) {
            log.warn("未找到构建员角色，请检查 Flyway 迁移是否执行");
        }
        if (!roleRepository.existsBySlug("scribe")) {
            log.warn("未找到记录员角色，请检查 Flyway 迁移是否执行");
        }
        if (!roleRepository.existsBySlug("project_admin")) {
            log.warn("未找到项目管理员角色，请检查 Flyway 迁移是否执行");
        }
        if (!roleRepository.existsBySlug("super_admin")) {
            log.warn("未找到超级管理员角色，请检查 Flyway 迁移是否执行");
        }
        log.info("角色检查完成");
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

        // 获取超级管理员角色（使用 slug 查询）
        Role superAdminRole = roleRepository.findBySlug("super_admin")
                .orElseGet(() -> {
                    log.warn("未找到超级管理员角色，创建默认角色");
                    Role role = Role.builder()
                            .name("超级管理员")
                            .slug("super_admin")
                            .description("系统级，不受项目限制")
                            .isAdmin(true)
                            .isSystem(true)
                            .build();
                    return roleRepository.save(role);
                });

        // 创建管理员用户
        User adminUser = User.builder()
                .username(ADMIN_USERNAME)
                .password(passwordEncoder.encode(ADMIN_PASSWORD))
                .email(ADMIN_EMAIL)
                .fullName(ADMIN_FULL_NAME)
                .isActive(true)
                .isSuperuser(true)
                .build();

        userRepository.save(adminUser);

        log.info("==========================================");
        log.info("管理员账户创建成功!");
        log.info("用户名：{}", ADMIN_USERNAME);
        log.info("密码：{}", ADMIN_PASSWORD);
        log.info("邮箱：{}", ADMIN_EMAIL);
        log.info("请在登录后及时修改密码!");
        log.info("==========================================");
    }
}
