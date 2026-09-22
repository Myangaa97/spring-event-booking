package com.event_booking.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import com.event_booking.entity.Event;

public record EventDto(
		Long id,
		String title,
		String description,
		LocalDate eventDate,
		LocalTime startTime,
		BigDecimal ticketPrice,
		Integer totalTickets,
		Integer availableTickets,
		boolean published,
		String imageUrl,
		CategoryDto category,
		VenueDto venue) {

	public static EventDto from(Event event) {
		return new EventDto(
				event.getId(),
				event.getTitle(),
				event.getDescription(),
				event.getEventDate(),
				event.getStartTime(),
				event.getTicketPrice(),
				event.getTotalTickets(),
				event.getAvailableTickets(),
				event.isPublished(),
				event.getImageUrl(),
				CategoryDto.from(event.getCategory()),
				VenueDto.from(event.getVenue()));
	}
}
