package com.example.demo.controller;

import com.example.demo.model.Book;
import com.example.demo.model.Comment;
import com.example.demo.repository.BookRepository;
import com.example.demo.repository.CommentRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/books")
@CrossOrigin(origins = "*")
public class BookController {

    private final BookRepository bookRepository;
    private final CommentRepository commentRepository;

    // Оновлений конструктор, який приймає ОБИДВА репозиторії
    public BookController(BookRepository bookRepository, CommentRepository commentRepository) {
        this.bookRepository = bookRepository;
        this.commentRepository = commentRepository;
    }

    // Твої старі методи (наприклад, GET для отримання всіх книг) залишаються тут:
    @GetMapping
    public List<Book> getAllBooks() {
        return bookRepository.findAll();
    }

    @GetMapping("/{id}")
    public Book getBookById(@PathVariable Long id) {
        return bookRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Książka nie znaleziona"));
    }

    @PostMapping
    public Book createBook(@RequestBody Book book) {
        return bookRepository.save(book);
    }

    // НОВИЙ МЕТОД: Додавання відгуку до конкретної книги за її ID
    @PostMapping("/{id}/comments")
    public Comment addComment(@PathVariable Long id, @RequestBody Comment comment) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Książka nie znaleziona z id: " + id));

        comment.setBook(book); // Зв'язуємо відгук з нашою книгою
        return commentRepository.save(comment); // Зберігаємо в таблицю comments
    }
}