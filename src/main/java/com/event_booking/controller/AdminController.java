package com.event_booking.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import com.event_booking.service.BookingService;
import com.event_booking.service.CategoryService;
import com.event_booking.service.EventService;
import com.event_booking.service.UserService;
import com.event_booking.service.VenueService;

@Controller
@RequestMapping("/admin")
public class AdminController {

	private final EventService eventService;
	private final CategoryService categoryService;
	private final VenueService venueService;
	private final BookingService bookingService;
	private final UserService userService;

	public AdminController(EventService eventService,
			CategoryService categoryService,
			VenueService venueService,
			BookingService bookingService,
			UserService userService) {
		this.eventService = eventService;
		this.categoryService = categoryService;
		this.venueService = venueService;
		this.bookingService = bookingService;
		this.userService = userService;
	}

	@GetMapping("/dashboard")
	public String dashboard(Model model) {
		var allBookings = bookingService.findAllDtos();
		model.addAttribute("totalEvents", eventService.findAll().size());
		model.addAttribute("totalBookings", bookingService.count());
		model.addAttribute("pendingBookings",
				allBookings.stream().filter(b -> "PENDING".equals(b.status())).count());
		model.addAttribute("totalUsers", userService.count());
		model.addAttribute("totalRevenue", allBookings.stream()
				.filter(b -> !"CANCELLED".equals(b.status()))
				.map(b -> b.total())
				.reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add));
		model.addAttribute("recentBookings", allBookings.stream().limit(5).toList());
		return "admin/dashboard";
	}

	@GetMapping("/categories")
	public String categories(Model model) {
		model.addAttribute("categories", categoryService.findAll());
		return "admin/categories";
	}

	@GetMapping("/venues")
	public String venues(Model model) {
		model.addAttribute("venues", venueService.findAll());
		return "admin/venues";
	}

	@GetMapping("/events")
	public String events(Model model) {
		model.addAttribute("events", eventService.findAll());
		return "admin/events";
	}

	@GetMapping("/bookings")
	public String bookings(Model model) {
		model.addAttribute("bookings", bookingService.findAllDtos());
		return "admin/bookings";
	}

	@GetMapping("/users")
	public String users(Model model) {
		model.addAttribute("users", userService.findAll());
		return "admin/users";
	}
}
