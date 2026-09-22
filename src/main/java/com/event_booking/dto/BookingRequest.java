package com.event_booking.dto;

import java.math.BigDecimal;

public record BookingRequest(Long eventId, int ticketQuantity) {

	public BigDecimal total(BigDecimal unitPrice) {
		return unitPrice.multiply(BigDecimal.valueOf(ticketQuantity));
	}
}
