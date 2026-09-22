package com.event_booking.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.event_booking.entity.EventCategory;

public interface EventCategoryRepository extends JpaRepository<EventCategory, Long> {

	boolean existsByName(String name);
}
