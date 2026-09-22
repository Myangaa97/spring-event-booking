package com.event_booking.controller.api;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/admin")
public class FileUploadController {

	private static final List<String> ALLOWED_EXTENSIONS = List.of(".jpg", ".jpeg", ".png", ".gif", ".webp");

	private final Path uploadDir;

	public FileUploadController(@Value("${app.upload.dir:uploads}") String uploadDir) throws IOException {
		this.uploadDir = Paths.get(uploadDir).toAbsolutePath().normalize();
		Files.createDirectories(this.uploadDir);
	}

	@PostMapping("/upload")
	public ResponseEntity<Map<String, String>> upload(@RequestParam("file") MultipartFile file) {
		if (file == null || file.isEmpty()) {
			return ResponseEntity.badRequest().body(Map.of("message", "File is empty"));
		}

		String contentType = file.getContentType();
		if (contentType == null || !contentType.startsWith("image/")) {
			return ResponseEntity.status(HttpStatus.UNSUPPORTED_MEDIA_TYPE)
					.body(Map.of("message", "Only image files are allowed"));
		}

		String original = file.getOriginalFilename() == null ? "image" : file.getOriginalFilename();
		String extension = "";
		int dot = original.lastIndexOf('.');
		if (dot >= 0 && dot < original.length() - 1) {
			extension = original.substring(dot).toLowerCase();
		}
		if (!ALLOWED_EXTENSIONS.contains(extension)) {
			extension = ".jpg";
		}

		String filename = UUID.randomUUID() + extension;
		Path target = uploadDir.resolve(filename).normalize();
		if (!target.startsWith(uploadDir)) {
			return ResponseEntity.badRequest().body(Map.of("message", "Invalid file path"));
		}

		try (InputStream in = file.getInputStream()) {
			Files.copy(in, target, StandardCopyOption.REPLACE_EXISTING);
		} catch (IOException e) {
			return ResponseEntity.internalServerError().body(Map.of("message", "Failed to store file"));
		}

		return ResponseEntity.ok(Map.of("url", "/uploads/" + filename));
	}
}
