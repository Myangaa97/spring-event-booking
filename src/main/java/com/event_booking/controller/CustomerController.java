package com.event_booking.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import com.event_booking.entity.User;
import com.event_booking.repository.UserRepository;
import com.event_booking.service.BookingService;
import com.event_booking.service.EventService;

@Controller
public class CustomerController {

	private final EventService eventService;
	private final BookingService bookingService;
	private final UserRepository userRepository;

	public CustomerController(EventService eventService,
			BookingService bookingService,
			UserRepository userRepository) {
		this.eventService = eventService;
		this.bookingService = bookingService;
		this.userRepository = userRepository;
	}

	@GetMapping("/events")
	public String events(Model model) {
		model.addAttribute("events", eventService.findPublished());
		return "customer/events";
	}

	@GetMapping("/events/{id}")
	public String eventDetail(@PathVariable Long id, Model model) {
		model.addAttribute("event", eventService.findById(id));
		return "customer/event-detail";
	}

	@GetMapping("/customer/dashboard")
	public String customerDashboard(@AuthenticationPrincipal UserDetails principal, Model model) {
		User user = currentUser(principal);
		var bookings = bookingService.findUserBookings(user);
		model.addAttribute("user", user);
		model.addAttribute("bookings", bookings);
		model.addAttribute("totalBookings", bookings.size());
		model.addAttribute("pendingCount", bookings.stream().filter(b -> "PENDING".equals(b.status())).count());
		model.addAttribute("confirmedCount", bookings.stream().filter(b -> "CONFIRMED".equals(b.status())).count());
		model.addAttribute("totalSpent", bookings.stream()
				.filter(b -> !"CANCELLED".equals(b.status()))
				.map(b -> b.total())
				.reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add));
		return "customer/dashboard";
	}

	@GetMapping("/customer/bookings")
	public String customerBookings(@AuthenticationPrincipal UserDetails principal, Model model) {
		User user = currentUser(principal);
		model.addAttribute("bookings", bookingService.findUserBookings(user));
		return "customer/bookings";
	}

	@GetMapping("/customer/bookings/{id}")
	public String customerBookingDetail(@AuthenticationPrincipal UserDetails principal,
			@PathVariable Long id, Model model) {
		var booking = bookingService.findEntityById(id);
		if (!booking.getUser().getEmail().equals(principal.getUsername())) {
			return "redirect:/customer/bookings";
		}
		model.addAttribute("booking", booking);
		return "customer/booking-detail";
	}

	private User currentUser(UserDetails principal) {
		return userRepository.findByEmail(principal.getUsername())
				.orElseThrow(() -> new IllegalArgumentException("User not found"));
	}
}
