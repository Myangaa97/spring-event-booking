package com.event_booking.service;

import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.event_booking.entity.Venue;
import com.event_booking.repository.EventRepository;
import com.event_booking.repository.VenueRepository;

@Service
@Transactional
public class VenueService {

	private final VenueRepository venueRepository;
	private final EventRepository eventRepository;

	public VenueService(VenueRepository venueRepository, EventRepository eventRepository) {
		this.venueRepository = venueRepository;
		this.eventRepository = eventRepository;
	}

	@Transactional(readOnly = true)
	public List<Venue> findAll() {
		return venueRepository.findAll();
	}

	@Transactional(readOnly = true)
	public Venue findById(Long id) {
		return venueRepository.findById(id)
				.orElseThrow(() -> new IllegalArgumentException("Venue not found: " + id));
	}

	public Venue create(Venue venue) {
		return venueRepository.save(venue);
	}

	public Venue update(Long id, Venue updated) {
		Venue venue = findById(id);
		venue.setName(updated.getName());
		venue.setAddress(updated.getAddress());
		venue.setCapacity(updated.getCapacity());
		return venueRepository.save(venue);
	}

	public void delete(Long id) {
		if (eventRepository.existsByVenueId(id)) {
			throw new IllegalStateException("Cannot delete venue that is used by events");
		}
		venueRepository.deleteById(id);
	}
}
