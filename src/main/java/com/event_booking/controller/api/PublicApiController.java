package com.event_booking.controller.api;

import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.event_booking.dto.CategoryDto;
import com.event_booking.dto.EventDto;
import com.event_booking.dto.VenueDto;
import com.event_booking.service.CategoryService;
import com.event_booking.service.EventService;
import com.event_booking.service.VenueService;

@RestController
@RequestMapping("/api/public")
public class PublicApiController {

	private final EventService eventService;
	private final CategoryService categoryService;
	private final VenueService venueService;

	public PublicApiController(EventService eventService,
			CategoryService categoryService,
			VenueService venueService) {
		this.eventService = eventService;
		this.categoryService = categoryService;
		this.venueService = venueService;
	}

	@GetMapping("/events")
	public List<EventDto> publishedEvents(@RequestParam(required = false) Long categoryId) {
		return eventService.findPublished().stream()
				.filter(e -> categoryId == null || e.getCategory().getId().equals(categoryId))
				.map(EventDto::from)
				.toList();
	}

	@GetMapping("/events/{id}")
	public EventDto eventDetail(@PathVariable Long id) {
		return EventDto.from(eventService.findById(id));
	}

	@GetMapping("/categories")
	public List<CategoryDto> categories() {
		return categoryService.findAll().stream()
				.map(CategoryDto::from)
				.toList();
	}

	@GetMapping("/venues")
	public List<VenueDto> venues() {
		return venueService.findAll().stream()
				.map(VenueDto::from)
				.toList();
	}
}
