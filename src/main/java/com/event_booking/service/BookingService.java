package com.event_booking.service;

import java.time.LocalDateTime;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.event_booking.dto.BookingDto;
import com.event_booking.entity.Booking;
import com.event_booking.entity.BookingStatus;
import com.event_booking.entity.Event;
import com.event_booking.entity.User;
import com.event_booking.repository.BookingRepository;
import com.event_booking.repository.EventRepository;

@Service
@Transactional
public class BookingService {

	private final BookingRepository bookingRepository;
	private final EventRepository eventRepository;
	private final EventService eventService;

	public BookingService(BookingRepository bookingRepository, EventRepository eventRepository,
			EventService eventService) {
		this.bookingRepository = bookingRepository;
		this.eventRepository = eventRepository;
		this.eventService = eventService;
	}

	public Booking book(User user, Long eventId, int ticketQuantity) {
		if (ticketQuantity < 1 || ticketQuantity > 10) {
			throw new IllegalArgumentException("Ticket quantity must be between 1 and 10");
		}
		Event event = eventRepository.findById(eventId)
				.orElseThrow(() -> new IllegalArgumentException("Event not found: " + eventId));
		if (!event.isPublished()) {
			throw new IllegalStateException("Event is not published");
		}
		if (eventService.hasStarted(event)) {
			throw new IllegalStateException("This event has already started or ended");
		}
		if (event.getAvailableTickets() < ticketQuantity) {
			throw new IllegalStateException("Not enough tickets available");
		}
		event.setAvailableTickets(event.getAvailableTickets() - ticketQuantity);

		Booking booking = new Booking();
		booking.setUser(user);
		booking.setEvent(event);
		booking.setTicketQuantity(ticketQuantity);
		booking.setUnitPrice(event.getTicketPrice());
		booking.setStatus(BookingStatus.CONFIRMED);
		booking.setCreatedAt(LocalDateTime.now());
		return bookingRepository.save(booking);
	}

	public void cancel(Long bookingId, User user) {
		Booking booking = bookingRepository.findById(bookingId)
				.orElseThrow(() -> new IllegalArgumentException("Booking not found: " + bookingId));
		if (!booking.getUser().getId().equals(user.getId())) {
			throw new SecurityException("You can only cancel your own bookings");
		}
		if (booking.getStatus() == BookingStatus.CANCELLED) {
			return;
		}
		Event event = booking.getEvent();
		event.setAvailableTickets(event.getAvailableTickets() + booking.getTicketQuantity());
		booking.setStatus(BookingStatus.CANCELLED);
	}

	public void updateStatus(Long bookingId, BookingStatus status) {
		Booking booking = bookingRepository.findById(bookingId)
				.orElseThrow(() -> new IllegalArgumentException("Booking not found: " + bookingId));
		if (status == BookingStatus.CANCELLED && booking.getStatus() != BookingStatus.CANCELLED) {
			Event event = booking.getEvent();
			event.setAvailableTickets(event.getAvailableTickets() + booking.getTicketQuantity());
		}
		booking.setStatus(status);
	}

	@Transactional(readOnly = true)
	public List<BookingDto> findUserBookings(User user) {
		return bookingRepository.findByUserOrderByCreatedAtDesc(user).stream()
				.map(BookingDto::from)
				.toList();
	}

	@Transactional(readOnly = true)
	public List<BookingDto> findAllDtos() {
		return bookingRepository.findAllByOrderByCreatedAtDesc().stream()
				.map(BookingDto::from)
				.toList();
	}

	@Transactional(readOnly = true)
	public Booking findEntityById(Long id) {
		return bookingRepository.findById(id)
				.orElseThrow(() -> new IllegalArgumentException("Booking not found: " + id));
	}

	@Transactional(readOnly = true)
	public long count() {
		return bookingRepository.count();
	}
}
