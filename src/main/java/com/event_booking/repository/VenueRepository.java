package com.event_booking.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.event_booking.entity.Venue;

public interface VenueRepository extends JpaRepository<Venue, Long> {
}
