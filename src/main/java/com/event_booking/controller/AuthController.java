package com.event_booking.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import com.event_booking.dto.RegisterRequest;
import com.event_booking.service.UserService;

@Controller
public class AuthController {

	private final UserService userService;

	public AuthController(UserService userService) {
		this.userService = userService;
	}

	@GetMapping("/login")
	public String loginPage() {
		return "auth/login";
	}

	@GetMapping("/register")
	public String registerPage(Model model) {
		model.addAttribute("registerRequest", new RegisterRequest("", "", "", ""));
		return "auth/register";
	}

	@PostMapping("/register")
	public String register(@ModelAttribute RegisterRequest request, Model model) {
		try {
			userService.register(request);
			return "redirect:/login?registered=true";
		} catch (IllegalStateException | IllegalArgumentException ex) {
			model.addAttribute("error", ex.getMessage());
			model.addAttribute("registerRequest", request);
			return "auth/register";
		}
	}
}
