package com.event_booking.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.event_booking.entity.Booking;
import com.event_booking.entity.User;

public interface BookingRepository extends JpaRepository<Booking, Long> {

	List<Booking> findByUserOrderByCreatedAtDesc(User user);

	List<Booking> findAllByOrderByCreatedAtDesc();

	boolean existsByEventId(Long eventId);
}
