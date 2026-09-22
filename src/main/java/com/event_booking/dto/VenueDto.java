package com.event_booking.dto;

import com.event_booking.entity.Venue;

public record VenueDto(Long id, String name, String address, Integer capacity) {

	public static VenueDto from(Venue venue) {
		return new VenueDto(venue.getId(), venue.getName(), venue.getAddress(), venue.getCapacity());
	}
}
