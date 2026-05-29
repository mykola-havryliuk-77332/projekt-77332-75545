package com.example.demo.controller;

import com.example.demo.model.Book;
import com.example.demo.model.Comment;
import com.example.demo.repository.BookRepository;
import com.example.demo.repository.CommentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*") // Щоб фронтенд міг спокійно достукатися
public class BookController {

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private CommentRepository commentRepository;

    // 1. Отримання всіх книг
    @GetMapping("/books")
    public List<Book> getAllBooks() {
        return bookRepository.findAll();
    }

    // 2. Отримання книги за ID
    @GetMapping("/books/{id}")
    public Book getBookById(@PathVariable Long id) {
        return bookRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Książka nie znaleziona z id: " + id));
    }

    // 3. Створення нової книги
    @PostMapping("/books")
    public Book createBook(@RequestBody Book book) {
        return bookRepository.save(book);
    }

    // 4. Повний метод додавання відгуку (ПІДЛАШТОВАНИЙ ПІД app.js)
    @PostMapping("/comments")
    public Comment addComment(@RequestBody Comment comment) {
        // Отримуємо bookId з того самого об'єкта, який приходить з фронту
        Long bookId = comment.getBookId();

        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Książka nie znaleziona z id: " + bookId));

        // Зв'язуємо коментар з книгою
        comment.setBook(book);

        // Перевірка автора (використовуємо методи, що є в твоєму Comment.java)
        if (comment.getAuthor() == null || comment.getAuthor().isEmpty()) {
            comment.setAuthor("Anonim");
        }

        return commentRepository.save(comment);
    }

    // 5. Видалення книги
    @DeleteMapping("/books/{id}")
    public void deleteBook(@PathVariable Long id) {
        bookRepository.deleteById(id);
    }
}