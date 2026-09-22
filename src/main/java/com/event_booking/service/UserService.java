package com.event_booking.service;

import java.util.List;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.event_booking.dto.RegisterRequest;
import com.event_booking.entity.RoleType;
import com.event_booking.entity.User;
import com.event_booking.repository.UserRepository;

@Service
@Transactional
public class UserService {

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;

	public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
	}

	@Transactional(readOnly = true)
	public User findByEmail(String email) {
		return userRepository.findByEmail(email.toLowerCase().trim())
				.orElseThrow(() -> new IllegalArgumentException("User not found: " + email));
	}

	@Transactional(readOnly = true)
	public boolean existsByEmail(String email) {
		return userRepository.existsByEmail(email.toLowerCase().trim());
	}

	@Transactional(readOnly = true)
	public long count() {
		return userRepository.count();
	}

	@Transactional(readOnly = true)
	public List<User> findAll() {
		return userRepository.findAllByOrderByIdAsc();
	}

	public User register(RegisterRequest request) {
		String email = request.email().toLowerCase().trim();
		if (userRepository.existsByEmail(email)) {
			throw new IllegalStateException("Email is already registered");
		}
		User user = new User();
		user.setFirstName(request.firstName().trim());
		user.setLastName(request.lastName().trim());
		user.setEmail(email);
		user.setPassword(passwordEncoder.encode(request.password()));
		user.setRole(RoleType.ROLE_USER);
		user.setEnabled(true);
		return userRepository.save(user);
	}
}
