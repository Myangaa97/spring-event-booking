package com.event_booking.controller.api;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.event_booking.dto.ApiResponse;
import com.event_booking.dto.BookingDto;
import com.event_booking.dto.CategoryDto;
import com.event_booking.dto.EventDto;
import com.event_booking.dto.UserDto;
import com.event_booking.dto.VenueDto;
import com.event_booking.entity.Event;
import com.event_booking.entity.EventCategory;
import com.event_booking.entity.Venue;
import com.event_booking.service.BookingService;
import com.event_booking.service.CategoryService;
import com.event_booking.service.EventService;
import com.event_booking.service.UserService;
import com.event_booking.service.VenueService;

@RestController
@RequestMapping("/api/admin")
public class AdminApiController {

	private final EventService eventService;
	private final CategoryService categoryService;
	private final VenueService venueService;
	private final BookingService bookingService;
	private final UserService userService;

	public AdminApiController(EventService eventService,
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

	// ---------- STATS ----------

	@GetMapping("/stats")
	public Map<String, Object> stats() {
		Map<String, Object> stats = new HashMap<>();
		stats.put("totalEvents", eventService.findAll().size());
		stats.put("totalBookings", bookingService.count());
		stats.put("pendingBookings", bookingService.findAllDtos().stream()
				.filter(b -> "PENDING".equals(b.status())).count());
		stats.put("totalUsers", userService.count());
		stats.put("totalRevenue", bookingService.findAllDtos().stream()
				.filter(b -> !"CANCELLED".equals(b.status()))
				.map(BookingDto::total)
				.reduce(BigDecimal.ZERO, BigDecimal::add));
		return stats;
	}

	// ---------- EVENTS ----------

	@GetMapping("/events")
	public List<EventDto> allEvents() {
		return eventService.findAll().stream().map(EventDto::from).toList();
	}

	@PostMapping("/events")
	public ApiResponse createEvent(@RequestBody EventRequest req) {
		Event event = new Event();
		applyEvent(event, req);
		event.setAvailableTickets(event.getTotalTickets());
		return ApiResponse.ok("Event created", EventDto.from(eventService.create(event)));
	}

	@PutMapping("/events/{id}")
	public ApiResponse updateEvent(@PathVariable Long id, @RequestBody EventRequest req) {
		Event event = eventService.findById(id);
		applyEvent(event, req);
		return ApiResponse.ok("Event updated", EventDto.from(eventService.update(id, event)));
	}

	@DeleteMapping("/events/{id}")
	public ApiResponse deleteEvent(@PathVariable Long id) {
		eventService.delete(id);
		return ApiResponse.ok("Event deleted");
	}

	// ---------- CATEGORIES ----------

	@GetMapping("/categories")
	public List<CategoryDto> allCategories() {
		return categoryService.findAll().stream().map(CategoryDto::from).toList();
	}

	@PostMapping("/categories")
	public ApiResponse createCategory(@RequestBody CategoryRequest req) {
		EventCategory category = new EventCategory();
		category.setName(req.name());
		return ApiResponse.ok("Category created", CategoryDto.from(categoryService.create(category)));
	}

	@PutMapping("/categories/{id}")
	public ApiResponse updateCategory(@PathVariable Long id, @RequestBody CategoryRequest req) {
		return ApiResponse.ok("Category updated", CategoryDto.from(categoryService.update(id, req.name())));
	}

	@DeleteMapping("/categories/{id}")
	public ApiResponse deleteCategory(@PathVariable Long id) {
		categoryService.delete(id);
		return ApiResponse.ok("Category deleted");
	}

	// ---------- VENUES ----------

	@GetMapping("/venues")
	public List<VenueDto> allVenues() {
		return venueService.findAll().stream().map(VenueDto::from).toList();
	}

	@PostMapping("/venues")
	public ApiResponse createVenue(@RequestBody VenueRequest req) {
		Venue venue = new Venue();
		applyVenue(venue, req);
		return ApiResponse.ok("Venue created", VenueDto.from(venueService.create(venue)));
	}

	@PutMapping("/venues/{id}")
	public ApiResponse updateVenue(@PathVariable Long id, @RequestBody VenueRequest req) {
		Venue venue = venueService.findById(id);
		applyVenue(venue, req);
		return ApiResponse.ok("Venue updated", VenueDto.from(venueService.update(id, venue)));
	}

	@DeleteMapping("/venues/{id}")
	public ApiResponse deleteVenue(@PathVariable Long id) {
		venueService.delete(id);
		return ApiResponse.ok("Venue deleted");
	}

	// ---------- USERS ----------

	@GetMapping("/users")
	public List<UserDto> allUsers() {
		return userService.findAll().stream().map(UserDto::from).toList();
	}

	// ---------- BOOKINGS ----------

	@GetMapping("/bookings")
	public List<BookingDto> allBookings() {
		return bookingService.findAllDtos();
	}

	@PutMapping("/bookings/{id}/status")
	public ApiResponse updateBookingStatus(@PathVariable Long id, @RequestBody StatusRequest req) {
		bookingService.updateStatus(id, com.event_booking.entity.BookingStatus.valueOf(req.status()));
		return ApiResponse.ok("Booking status updated to " + req.status());
	}

	// ---------- REQUEST BODIES ----------

	public record EventRequest(String title, String description, LocalDate eventDate, String startTime,
			BigDecimal ticketPrice, Integer totalTickets, boolean published, String imageUrl,
			Long categoryId, Long venueId) {
	}

	public record CategoryRequest(String name) {
	}

	public record VenueRequest(String name, String address, Integer capacity) {
	}

	public record StatusRequest(String status) {
	}

	// ---------- HELPERS ----------

	private void applyEvent(Event event, EventRequest req) {
		event.setTitle(req.title());
		event.setDescription(req.description());
		event.setEventDate(req.eventDate());
		if (req.startTime() != null && !req.startTime().isBlank()) {
			event.setStartTime(java.time.LocalTime.parse(req.startTime()));
		}
		event.setTicketPrice(req.ticketPrice());
		if (req.totalTickets() != null) {
			int sold = (event.getTotalTickets() == null ? 0 : event.getTotalTickets())
					- (event.getAvailableTickets() == null ? 0 : event.getAvailableTickets());
			event.setTotalTickets(req.totalTickets());
			event.setAvailableTickets(Math.max(0, req.totalTickets() - Math.max(0, sold)));
		}
		event.setPublished(req.published());
		event.setImageUrl(req.imageUrl());
		if (req.categoryId() != null) {
			event.setCategory(categoryService.findById(req.categoryId()));
		}
		if (req.venueId() != null) {
			event.setVenue(venueService.findById(req.venueId()));
		}
	}

	private void applyVenue(Venue venue, VenueRequest req) {
		venue.setName(req.name());
		venue.setAddress(req.address());
		venue.setCapacity(req.capacity());
	}
}
