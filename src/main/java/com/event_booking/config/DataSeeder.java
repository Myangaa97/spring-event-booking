package com.event_booking.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import com.event_booking.entity.RoleType;
import com.event_booking.entity.User;
import com.event_booking.repository.UserRepository;

/**
 * Зөвхөн админ аккаунт үүсгэнэ.
 * Категори, зочлох газар, үйл ажиллагааны дата-г бүгдийг
 * админ панелаас (Admin Dashboard) гараар оруулна.
 */
@Component
public class DataSeeder implements CommandLineRunner {

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;

	public DataSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
	}

	@Override
	public void run(String... args) {
		if (userRepository.findByEmail("admin@kiloe.mn").isPresent()) {
			return;
		}

		User admin = new User();
		admin.setFirstName("Admin");
		admin.setLastName("KiloE");
		admin.setEmail("admin@kiloe.mn");
		admin.setPassword(passwordEncoder.encode("admin123"));
		admin.setRole(RoleType.ROLE_ADMIN);
		admin.setEnabled(true);
		userRepository.save(admin);
	}
}
