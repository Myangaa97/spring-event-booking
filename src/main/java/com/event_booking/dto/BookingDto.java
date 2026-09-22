package com.event_booking.dto;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import com.event_booking.entity.Booking;

public record BookingDto(
		Long id,
		Long eventId,
		String eventTitle,
		String eventDate,
		String startTime,
		String venueName,
		String categoryName,
		int ticketQuantity,
		BigDecimal unitPrice,
		BigDecimal total,
		String status,
		String createdAt) {

	private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd");
	private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("HH:mm");

	public static BookingDto from(Booking booking) {
		return new BookingDto(
				booking.getId(),
				booking.getEvent().getId(),
				booking.getEvent().getTitle(),
				booking.getEvent().getEventDate().toString(),
				booking.getEvent().getStartTime().format(TIME_FMT),
				booking.getEvent().getVenue().getName(),
				booking.getEvent().getCategory().getName(),
				booking.getTicketQuantity(),
				booking.getUnitPrice(),
				booking.getUnitPrice()
						.multiply(BigDecimal.valueOf(booking.getTicketQuantity()))
						.setScale(2, RoundingMode.HALF_UP),
				booking.getStatus().name(),
				booking.getCreatedAt().format(DATE_FMT));
	}
}
