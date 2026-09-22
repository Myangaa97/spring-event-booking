package com.event_booking.service;

import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.event_booking.entity.EventCategory;
import com.event_booking.repository.EventCategoryRepository;
import com.event_booking.repository.EventRepository;

@Service
@Transactional
public class CategoryService {

	private final EventCategoryRepository categoryRepository;
	private final EventRepository eventRepository;

	public CategoryService(EventCategoryRepository categoryRepository, EventRepository eventRepository) {
		this.categoryRepository = categoryRepository;
		this.eventRepository = eventRepository;
	}

	@Transactional(readOnly = true)
	public List<EventCategory> findAll() {
		return categoryRepository.findAll();
	}

	@Transactional(readOnly = true)
	public EventCategory findById(Long id) {
		return categoryRepository.findById(id)
				.orElseThrow(() -> new IllegalArgumentException("Category not found: " + id));
	}

	public EventCategory create(EventCategory category) {
		return categoryRepository.save(category);
	}

	public EventCategory update(Long id, String name) {
		EventCategory category = findById(id);
		category.setName(name);
		return categoryRepository.save(category);
	}

	public void delete(Long id) {
		if (eventRepository.existsByCategoryId(id)) {
			throw new IllegalStateException("Cannot delete category that is used by events");
		}
		categoryRepository.deleteById(id);
	}
}
