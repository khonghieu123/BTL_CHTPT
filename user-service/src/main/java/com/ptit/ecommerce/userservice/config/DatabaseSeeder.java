package com.ptit.ecommerce.userservice.config;

import com.ptit.ecommerce.userservice.model.User;
import com.ptit.ecommerce.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Seeds the database with an initial admin account on first startup.
 * Credentials: admin / admin123
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DatabaseSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Override
    public void run(String... args) {
        log.info("[Seeder] Kiểm tra tài khoản admin mặc định...");
        seedAdmin();
        log.info("[Seeder] Hoàn thành khởi tạo.");
    }

    private void seedAdmin() {
        if (userRepository.existsByUsername("admin")) {
            log.info("[Seeder] Tài khoản admin đã tồn tại – bỏ qua.");
            return;
        }
        User admin = User.builder()
                .username("admin")
                .password(passwordEncoder.encode("admin123"))
                .email("admin@apex.com")
                .role("ROLE_ADMIN")
                .fullName("Administrator")
                .phone("")
                .address("")
                .build();
        userRepository.save(admin);
        log.info("[Seeder] Đã tạo tài khoản admin / admin123");
    }
}
