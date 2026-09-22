package com.event_booking.dto;

import com.event_booking.entity.User;

public record UserDto(Long id, String firstName, String lastName, String email,
		String role, boolean enabled) {

	public static UserDto from(User user) {
		return new UserDto(user.getId(), user.getFirstName(), user.getLastName(),
				user.getEmail(), user.getRole().name(), user.isEnabled());
	}
}
