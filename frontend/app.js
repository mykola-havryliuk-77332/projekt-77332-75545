// --- KONFIGURACJA API (Zostawiamy Twój oryginalny Railway) ---
const BASE_URL = 'https://projekt-77332-75545-production.up.railway.app/api';
const API_URL = `${BASE_URL}/books`;

let books = [];
let isAdmin = false;
let currentBookId = null;

// Zmienna do przechowywania e-maila zalogowanego użytkownika (aby podstawiać jako autora komentarzy)
let currentUserEmail = null; 

document.addEventListener('DOMContentLoaded', async () => {
    try {
        await loadComponent('header-placeholder', 'components/header.html');
        await loadComponent('admin-placeholder', 'components/admin-section.html');
        await loadComponent('catalog-placeholder', 'components/catalog-section.html');
        await loadComponent('modals-placeholder', 'components/modals.html');

        initApp();
    } catch (error) {
        console.error(error);
    }
});

async function loadComponent(elementId, filepath) {
    const response = await fetch(filepath);
    const html = await response.text();
    document.getElementById(elementId).innerHTML = html;
}

async function initApp() {
    try {
        const response = await fetch(API_URL);
        books = await response.json();
    } catch (err) {
        console.error(err);
    }
    
    renderBooks();
    setupUIListeners();
    setupAuthListeners();
    setupBooksListeners();
    toggleAdminMode();
    setupThemeToggle();
}

function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span>${message}</span>
        <span class="toast-close" onclick="this.parentElement.remove()">&times;</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('fade-out');
        toast.addEventListener('animationend', () => toast.remove());
    }, 3000);
}

function renderBooks(booksToRender = books) {
    const booksContainer = document.getElementById('books-container');
    if (!booksContainer) return;
    booksContainer.innerHTML = '';

    if (booksToRender.length === 0) {
        booksContainer.innerHTML = '<p class="empty-message">Brak wyników do wyświetlenia.</p>';
        return;
    }

    booksToRender.forEach(book => {
        const card = document.createElement('div');
        card.className = 'book-card';
        
        const coverUrl = book.coverUrl ? book.coverUrl : 'img/book.png';

        let avgRating = "Brak ocen";
        if(book.comments && book.comments.length > 0) {
            // Sprawdzamy, czy rating to ciąg znaków (gwiazdki) czy liczba
            const sum = book.comments.reduce((acc, curr) => {
                const r = curr.rating;
                return acc + (typeof r === 'string' ? r.length : Number(r) || 0);
            }, 0);
            avgRating = "⭐".repeat(Math.round(sum / book.comments.length)) || "Brak ocen";
        }

        card.innerHTML = `
            <div class="card-cover" style="background-image: url('${coverUrl}')" onclick="openModal('${book.id}')"></div>
            <div class="card-content" onclick="openModal('${book.id}')">
                <span class="badge">${book.genre || 'Książka'}</span>
                <h3>${book.title}</h3>
                <p class="author">${book.author}</p>
                <p style="font-size: 0.8rem; margin-top: 8px;">${avgRating}</p>
            </div>
            <div class="card-actions" style="display: ${isAdmin ? 'flex' : 'none'}">
                <button class="btn-edit" onclick="editBook('${book.id}')">Edytuj</button>
                <button class="btn-danger" onclick="deleteBook('${book.id}')">Usuń</button>
            </div>
        `;
        booksContainer.appendChild(card);
    });
}

function resetForm() {
    document.getElementById('add-book-form').reset();
    document.getElementById('edit-book-id').value = '';
    document.getElementById('form-title').textContent = 'Dodaj nową książkę';
    document.getElementById('submit-book-btn').textContent = 'Zapisz książkę';
    document.getElementById('cancel-edit-btn').classList.add('hidden');
}

function setupUIListeners() {
    document.getElementById('close-book-modal').addEventListener('click', () => {
        document.getElementById('book-modal').classList.add('hidden');
    });
    
    document.getElementById('cancel-edit-btn').addEventListener('click', resetForm);

    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal') && !e.target.classList.contains('full-page-modal')) {
            e.target.classList.add('hidden');
        }
    });
}

function setupAuthListeners() {
    const loginModal = document.getElementById('login-modal');
    const registerModal = document.getElementById('register-modal');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    const switchToRegister = document.getElementById('switch-to-register');
    const switchToLogin = document.getElementById('switch-to-login');

    document.getElementById('btn-login').addEventListener('click', () => loginModal.classList.remove('hidden'));
    document.getElementById('btn-register').addEventListener('click', () => registerModal.classList.remove('hidden'));
    
    document.getElementById('close-login-modal').addEventListener('click', () => loginModal.classList.add('hidden'));
    document.getElementById('close-register-modal').addEventListener('click', () => registerModal.classList.add('hidden'));

    switchToRegister.addEventListener('click', () => {
        loginModal.classList.add('hidden');
        registerModal.classList.remove('hidden');
    });

    switchToLogin.addEventListener('click', () => {
        registerModal.classList.add('hidden');
        loginModal.classList.remove('hidden');
    });

    // --- REALNE LOGOWANIE PRZEZ BACKEND NA RAILWAY ---
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = loginForm.querySelector('input[type="email"]').value;
        const password = loginForm.querySelector('input[type="password"]').value;

        try {
            const response = await fetch(`${BASE_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email, password: password })
            });

            const result = await response.json();

            if (response.ok && result.success !== false) {
                currentUserEmail = email;
                // Jeśli e-mail należy do admina lub backend zwrócił rolę ADMIN
                if(email === 'admin@admin.com' || result.role === 'ADMIN') {
                    isAdmin = true;
                    showToast('Zalogowano pomyślnie jako Administrator!', 'success');
                } else {
                    isAdmin = false;
                    showToast('Zalogowano jako Użytkownik!', 'success');
                }
                toggleAdminMode();
                loginModal.classList.add('hidden');
                loginForm.reset();
            } else {
                showToast(result.message || 'Błędny e-mail lub hasło!', 'error');
            }
        } catch (err) {
            console.error(err);
            showToast('Błąd połączenia z serwerem!', 'error');
        }
    });

    // --- REALNA REJESTRACJA PRZEZ BACKEND NA RAILWAY ---
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = registerForm.querySelector('input[type="text"]').value;
        const email = registerForm.querySelector('input[type="email"]').value;
        const password = registerForm.querySelector('input[type="password"]').value;

        try {
            const response = await fetch(`${BASE_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: name, email: email, password: password })
            });

            if (response.ok) {
                showToast('Konto zostało pomyślnie utworzone!', 'success');
                registerModal.classList.add('hidden');
                registerForm.reset();
            } else {
                const errData = await response.json();
                showToast(errData.message || 'Rejestracja nie powiodła się!', 'error');
            }
        } catch (err) {
            console.error(err);
            showToast('Błąd rejestracji!', 'error');
        }
    });
}

function toggleAdminMode() {
    const adminSection = document.getElementById('admin-section');
    if (adminSection) adminSection.style.display = isAdmin ? 'block' : 'none';
    
    const commentForm = document.getElementById('add-comment-form');
    const loginPrompt = document.getElementById('login-prompt-comments');

    // Formularz komentarzy jest teraz dostępny dla każdego zalogowanego użytkownika
    if (commentForm && loginPrompt) {
        if (currentUserEmail !== null) { 
            commentForm.classList.remove('hidden');
            loginPrompt.classList.add('hidden');
        } else {
            commentForm.classList.add('hidden');
            loginPrompt.classList.remove('hidden');
        }
    }
    
    const mainContent = document.querySelector('.main-content');
    if (mainContent) mainContent.style.gridTemplateColumns = isAdmin ? '280px 1fr' : '1fr';
    renderBooks();
}

function setupBooksListeners() {
    const bookForm = document.getElementById('add-book-form');
    const searchInput = document.getElementById('search-input');
    const commentForm = document.getElementById('add-comment-form');

    bookForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('edit-book-id').value;
        
        const bookData = {
            title: document.getElementById('title').value,
            author: document.getElementById('author').value,
            genre: document.getElementById('genre').value,
            coverUrl: document.getElementById('cover').value, 
            description: document.getElementById('description').value,
            pages: 150
        };

        if (id) {
            try {
                await fetch(`${API_URL}/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(bookData)
                });
                const res = await fetch(API_URL);
                books = await res.json();
                renderBooks();
                showToast('Zaktualizowano informacje o książce.', 'success');
            } catch (err) {
                console.error(err);
                showToast('Błąd aktualizacji książki!', 'error');
            }
        } else {
            try {
                await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(bookData)
                });
                const res = await fetch(API_URL);
                books = await res.json();
                renderBooks();
                showToast('Książka została pomyślnie dodana!', 'success');
            } catch (err) {
                console.error(err);
                showToast('Nie udało się dodać książki!', 'error');
            }
        }
        resetForm();
    });

    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = books.filter(b => 
            b.title.toLowerCase().includes(term) || 
            b.author.toLowerCase().includes(term)
        );
        renderBooks(filtered);
    });

    // --- REALNE DODAWANIE KOMENTARZY NA BACKEND RAILWAY ---
    commentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const commentText = commentForm.querySelector('textarea, input[type="text"]').value;
        const ratingInput = commentForm.querySelector('select, input[type="number"]');
        const ratingValue = ratingInput ? ratingInput.value : 5;

        const commentData = {
            bookId: currentBookId,
            author: currentUserEmail || "Anonim",
            text: commentText,
            rating: ratingValue
        };

        try {
            const response = await fetch(`${BASE_URL}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(commentData)
            });

            if (response.ok) {
                showToast('Komentarz został dodany!', 'success');
                e.target.reset();
                
                // Aktualizujemy dane, aby zobaczyć nowy komentarz
                const res = await fetch(API_URL);
                books = await res.json();
                
                // Ponownie otwieramy modal tej samej książki, aby komentarz od razu się pojawił
                openModal(currentBookId);
            } else {
                showToast('Nie udało się dodać komentarza!', 'error');
            }
        } catch (err) {
            console.error(err);
            showToast('Błąd połączenia z bazą danych!', 'error');
        }
    });
}

window.deleteBook = async function(id) {
    if (confirm('Czy na pewno chcesz usunąć tę książkę z katalogu?')) {
        try {
            await fetch(`${API_URL}/${id}`, {
                method: 'DELETE'
            });
            const res = await fetch(API_URL);
            books = await res.json();
            renderBooks();
            showToast('Książka usunięta z katalogu.', 'warning');
        } catch (err) {
            console.error(err);
            showToast('Błąd podczas usuwania!', 'error');
        }
    }
}

window.editBook = function(id) {
    const book = books.find(b => b.id == id);
    if (book) {
        document.getElementById('title').value = book.title;
        document.getElementById('author').value = book.author;
        document.getElementById('genre').value = book.genre || '';
        document.getElementById('cover').value = book.coverUrl || '';
        document.getElementById('description').value = book.description || '';
        
        document.getElementById('edit-book-id').value = book.id;
        document.getElementById('form-title').textContent = 'Edytuj książkę';
        document.getElementById('submit-book-btn').textContent = 'Zapisz zmiany';
        document.getElementById('cancel-edit-btn').classList.remove('hidden');
        window.scrollTo(0, 0);
    }
}

window.openModal = function(id) {
    const book = books.find(b => b.id == id);
    if (book) {
        currentBookId = id;
        document.getElementById('modal-title').textContent = book.title;
        document.getElementById('modal-author').textContent = book.author;
        document.getElementById('modal-genre').textContent = book.genre || 'Książka';
        document.getElementById('modal-description').textContent = book.description || 'Brak opisu.';
        
        const coverImg = document.getElementById('modal-cover');
        coverImg.src = book.coverUrl ? book.coverUrl : 'img/book.png';
        renderComments(book.comments || []);
        document.getElementById('book-modal').classList.remove('hidden');
    }
}

function renderComments(comments) {
    const list = document.getElementById('comments-list');
    if (!list) return;
    
    if (comments.length === 0) {
        list.innerHTML = '<p class="empty-message">Brak komentarzy. Bądź pierwszy!</p>';
        return;
    }

    list.innerHTML = comments.map(c => `
        <div class="comment">
            <div class="comment-header"><strong>${c.author || 'Użytkownik'}</strong></div>
            <p>${c.text}</p>
        </div>
    `).join('');
}

function setupThemeToggle() {
    const themeBtn = document.getElementById('theme-toggle');
    if (!themeBtn) return;

    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
    }

    themeBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        
        if (document.body.classList.contains('dark-mode')) {
            localStorage.setItem('theme', 'dark');
        } else {
            localStorage.setItem('theme', 'light');
        }
    });
}