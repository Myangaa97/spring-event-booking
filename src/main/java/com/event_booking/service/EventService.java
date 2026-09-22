package com.event_booking.service;

import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.event_booking.entity.Event;
import com.event_booking.entity.EventCategory;
import com.event_booking.repository.BookingRepository;
import com.event_booking.repository.EventRepository;

@Service
@Transactional
public class EventService {

	private final EventRepository eventRepository;
	private final BookingRepository bookingRepository;

	public EventService(EventRepository eventRepository, BookingRepository bookingRepository) {
		this.eventRepository = eventRepository;
		this.bookingRepository = bookingRepository;
	}

	@Transactional(readOnly = true)
	public List<Event> findPublished() {
		return eventRepository.findByPublishedTrueAndEventDateGreaterThanEqualOrderByEventDateAsc(java.time.LocalDate.now())
				.stream()
				.filter(e -> !hasStarted(e))
				.toList();
	}

	public boolean hasStarted(Event event) {
		if (event.getStartTime() == null) {
			return event.getEventDate().isBefore(java.time.LocalDate.now());
		}
		return java.time.LocalDateTime.of(event.getEventDate(), event.getStartTime())
				.isBefore(java.time.LocalDateTime.now());
	}

	@Transactional(readOnly = true)
	public List<Event> findAll() {
		return eventRepository.findAllByOrderByEventDateDesc();
	}

	@Transactional(readOnly = true)
	public Event findById(Long id) {
		return eventRepository.findById(id)
				.orElseThrow(() -> new IllegalArgumentException("Event not found: " + id));
	}

	public Event create(Event event) {
		return eventRepository.save(event);
	}

	public Event update(Long id, Event updated) {
		Event event = findById(id);
		event.setTitle(updated.getTitle());
		event.setDescription(updated.getDescription());
		event.setEventDate(updated.getEventDate());
		event.setStartTime(updated.getStartTime());
		event.setTicketPrice(updated.getTicketPrice());
		event.setTotalTickets(updated.getTotalTickets());
		int sold = event.getTotalTickets() - event.getAvailableTickets();
		event.setAvailableTickets(Math.max(0, updated.getTotalTickets() - Math.max(0, sold)));
		event.setPublished(updated.isPublished());
		event.setImageUrl(updated.getImageUrl());
		event.setCategory(updated.getCategory());
		event.setVenue(updated.getVenue());
		return eventRepository.save(event);
	}

	public void delete(Long id) {
		if (bookingRepository.existsByEventId(id)) {
			throw new IllegalStateException("Cannot delete event with existing bookings");
		}
		eventRepository.deleteById(id);
	}
}
