package com.event_booking.repository;

import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.event_booking.entity.Event;
import com.event_booking.entity.EventCategory;
import com.event_booking.entity.Venue;

public interface EventRepository extends JpaRepository<Event, Long> {

	List<Event> findByPublishedTrueAndEventDateGreaterThanEqualOrderByEventDateAsc(LocalDate date);

	List<Event> findAllByOrderByEventDateDesc();

	List<Event> findByCategoryAndPublishedTrueOrderByEventDateAsc(EventCategory category);

	List<Event> findByVenue(Venue venue);

	boolean existsByCategoryId(Long categoryId);

	boolean existsByVenueId(Long venueId);
}
