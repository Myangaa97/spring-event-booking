package com.event_booking.controller.api;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.event_booking.dto.ApiResponse;
import com.event_booking.dto.BookingDto;
import com.event_booking.dto.BookingRequest;
import com.event_booking.entity.User;
import com.event_booking.repository.UserRepository;
import com.event_booking.service.BookingService;

@RestController
@RequestMapping("/api/bookings")
public class BookingApiController {

	private final BookingService bookingService;
	private final UserRepository userRepository;

	public BookingApiController(BookingService bookingService, UserRepository userRepository) {
		this.bookingService = bookingService;
		this.userRepository = userRepository;
	}

	@GetMapping
	public List<BookingDto> myBookings(@AuthenticationPrincipal UserDetails principal) {
		User user = currentUser(principal);
		return bookingService.findUserBookings(user);
	}

	@PostMapping
	public ResponseEntity<ApiResponse> book(@AuthenticationPrincipal UserDetails principal,
			@RequestBody BookingRequest request) {
		User user = currentUser(principal);
		var booking = bookingService.book(user, request.eventId(), request.ticketQuantity());
		return ResponseEntity.ok(ApiResponse.ok("Booking confirmed", BookingDto.from(booking)));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<ApiResponse> cancel(@AuthenticationPrincipal UserDetails principal,
			@PathVariable Long id) {
		User user = currentUser(principal);
		bookingService.cancel(id, user);
		return ResponseEntity.ok(ApiResponse.ok("Booking cancelled"));
	}

	private User currentUser(UserDetails principal) {
		return userRepository.findByEmail(principal.getUsername())
				.orElseThrow(() -> new IllegalArgumentException("User not found"));
	}
}
