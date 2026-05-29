package com.example.demo.controller;

import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*") // Дозволяє фронтенду робити запити
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // 1. РЕЄСТРАЦІЯ (Приймає fullName, email, password)
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        try {
            // Перевіряємо, чи email взагалі передано
            if (user.getEmail() == null || user.getEmail().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Email nie może być pusty!"));
            }

            // Перевіряємо, чи email вже не зайнятий
            if (userRepository.findByEmail(user.getEmail()).isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Użytkownik z tym e-mail już istnieje!"));
            }

            // За замовчуванням кожному даємо роль "USER"
            if (user.getRole() == null || user.getRole().isEmpty()) {
                user.setRole("USER");
            }

            User savedUser = userRepository.save(user);
            return ResponseEntity.ok(Map.of(
                    "message", "Rejestracja udana!",
                    "email", savedUser.getEmail()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                    "message", "Błąd serwera podczas rejestracji: " + e.getMessage()
            ));
        }
    }

    // 2. ВХІД / ЛОГІН (Приймає тільки email та password)
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody Map<String, String> credentials) {
        try {
            String email = credentials.get("email");
            String password = credentials.get("password");

            // Захист: перевіряємо чи прийшли дані з фронтенду
            if (email == null || password == null || email.isEmpty() || password.isEmpty()) {
                return ResponseEntity.status(400).body(Map.of(
                        "success", false,
                        "message", "Wpisz e-mail i hasło!"
                ));
            }

            Optional<User> userOpt = userRepository.findByEmail(email);

            // Перевіряємо наявність юзера та збіг пароля (з безпечною перевіркою на null)
            if (userOpt.isPresent() && userOpt.get().getPassword() != null && userOpt.get().getPassword().equals(password)) {
                User user = userOpt.get();
                boolean isAdmin = "ADMIN".equals(user.getRole());

                // Повертаємо дані для сесії на фронтенді, захищаючи поля від null
                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "fullName", user.getFullName() != null ? user.getFullName() : "Użytkownik",
                        "email", user.getEmail(),
                        "role", user.getRole() != null ? user.getRole() : "USER",
                        "isAdmin", isAdmin
                ));
            }

            // Якщо дані невірні — помилка 401
            return ResponseEntity.status(401).body(Map.of(
                    "success", false,
                    "message", "Błędny e-mail lub hasło!"
            ));

        } catch (Exception e) {
            // Виведе точну помилку в консоль Railway, щоб ми могли її прочитати
            e.printStackTrace();

            // Поверне текст помилки прямо на фронтенд у тост
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "Błąd serwera: " + e.getMessage()
            ));
        }
    }
}
