package com.event_booking.dto;

import com.event_booking.entity.EventCategory;

public record CategoryDto(Long id, String name) {

	public static CategoryDto from(EventCategory category) {
		return new CategoryDto(category.getId(), category.getName());
	}
}
