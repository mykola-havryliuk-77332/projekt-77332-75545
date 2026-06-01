const API_URL = 'https://projekt-77332-75545-production.up.railway.app/api/books';
let books = [];
let isAdmin = false;
let currentUser = null; 
let currentBookId = null;

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
    const response = await fetch(filepath + '?v=' + new Date().getTime());
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
    setupAuthForms();
    setupBooksListeners();
    setupPasswordToggles();
    updateAuthUI(); 
    toggleAdminMode();
    setupThemeToggle();
}

function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${message}</span><span class="toast-close" onclick="this.parentElement.remove()">&times;</span>`;
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
            const sum = book.comments.reduce((acc, curr) => {
                let r = curr.rating;
                if (!r) return acc;
                if (!isNaN(r)) return acc + Number(r);
                if (typeof r === 'string') {
                    const matches = r.match(/⭐/g);
                    if (matches) return acc + matches.length;
                    return acc + (parseFloat(r) || 0);
                }
                return acc;
            }, 0);
            let avg = Math.round(sum / book.comments.length) || 0;
            if (avg > 5) avg = 5;
            avgRating = avg > 0 ? "⭐".repeat(avg) : "Brak ocen";
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
    document.getElementById('close-book-modal')?.addEventListener('click', () => {
        document.getElementById('book-modal')?.classList.add('hidden');
    });
    document.getElementById('cancel-edit-btn')?.addEventListener('click', resetForm);
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal') && !e.target.classList.contains('full-page-modal')) {
            e.target.classList.add('hidden');
        }
    });
}

function setupPasswordToggles() {
    const toggleBtns = document.querySelectorAll('.pwd-toggle-btn');
    toggleBtns.forEach(btn => {
        const input = btn.previousElementSibling;
        
        const showPwd = (e) => {
            if (e.cancelable) e.preventDefault(); 
            input.type = 'text';
            btn.style.opacity = '0.5';
        };
        
        const hidePwd = () => {
            input.type = 'password';
            btn.style.opacity = '1';
        };

        btn.addEventListener('mousedown', showPwd);
        btn.addEventListener('mouseup', hidePwd);
        btn.addEventListener('mouseleave', hidePwd);
        btn.addEventListener('touchstart', showPwd, {passive: false});
        btn.addEventListener('touchend', hidePwd);
        btn.addEventListener('touchcancel', hidePwd);
    });
}

function setupAuthForms() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginModal = document.getElementById('login-modal');
    const registerModal = document.getElementById('register-modal');

    document.getElementById('close-login-modal')?.addEventListener('click', () => loginModal.classList.add('hidden'));
    document.getElementById('close-register-modal')?.addEventListener('click', () => registerModal.classList.add('hidden'));
    document.getElementById('close-profile-modal')?.addEventListener('click', () => {
        document.getElementById('profile-modal').classList.add('hidden');
    });
    document.getElementById('switch-to-register')?.addEventListener('click', () => {
        loginModal.classList.add('hidden');
        registerModal.classList.remove('hidden');
    });
    document.getElementById('switch-to-login')?.addEventListener('click', () => {
        registerModal.classList.add('hidden');
        loginModal.classList.remove('hidden');
    });
    
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = loginForm.querySelector('input[type="email"]').value;
            const password = loginForm.querySelector('input[type="password"]').value;

            try {
                const response = await fetch('https://projekt-77332-75545-production.up.railway.app/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: email, password: password })
                });

                const data = await response.json();

                if (response.ok) {
                    isAdmin = (data.role === 'ADMIN');
                    currentUser = { name: data.fullName || email.split('@')[0], email: email };
                    
                    showToast('Zalogowano pomyślnie!', 'success');
                    loginModal.classList.add('hidden');
                    loginForm.reset();
                    updateAuthUI();
                    toggleAdminMode();
                } else {
                    showToast(data.message || 'Błędny e-mail lub hasło!', 'error');
                }
            } catch (err) {
                console.error(err);
                showToast('Błąd połączenia z serwerem!', 'error');
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const fullName = registerForm.querySelector('input[name="fullName"]').value;
            const email = registerForm.querySelector('input[name="email"]').value;
            const password = registerForm.querySelector('input[name="password"]').value;

            try {
                const response = await fetch('https://projekt-77332-75545-production.up.railway.app/api/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ fullName, email, password })
                });

                if (response.ok) {
                    showToast('Konto utworzone! Możesz się zalogować.', 'success');
                    registerModal.classList.add('hidden');
                    registerForm.reset();
                    document.getElementById('login-modal').classList.remove('hidden');
                } else {
                    const data = await response.json();
                    showToast(data.message || 'Błąd rejestracji!', 'error');
                }
            } catch (err) {
                console.error(err);
                showToast('Błąd połączenia z serwerem!', 'error');
            }
        });
    }
}

function updateAuthUI() {
    const authContainer = document.querySelector('.auth-buttons');
    if (!authContainer) return;
    const themeBtn = document.getElementById('theme-toggle');
    authContainer.innerHTML = '';
    if (themeBtn) authContainer.appendChild(themeBtn);
    
    if (currentUser) {
        const authDiv = document.createElement('div');
        authDiv.style.display = 'flex';
        authDiv.style.alignItems = 'center';
        authDiv.style.gap = '15px';
        authDiv.innerHTML = `
            <span style="font-weight: 600; color: var(--primary-color);">Cześć, ${currentUser.name}!</span>
            <button id="dynamic-btn-profile" class="btn-outline" style="padding: 6px 12px;">Profil</button>
            <button id="dynamic-btn-logout" class="btn-danger" style="padding: 6px 12px;">Wyloguj</button>
        `;
        authContainer.appendChild(authDiv);

        document.getElementById('dynamic-btn-logout').addEventListener('click', () => {
            currentUser = null;
            isAdmin = false;
            updateAuthUI();
            toggleAdminMode();
            showToast('Wylogowano pomyślnie.', 'warning');
        });
        
        document.getElementById('dynamic-btn-profile').addEventListener('click', () => {
            const profileModal = document.getElementById('profile-modal');
            if (profileModal) {
                document.getElementById('profile-name-display').textContent = currentUser.name;
                document.getElementById('profile-email-display').textContent = currentUser.email;
                document.getElementById('profile-role-display').textContent = isAdmin ? 'Administrator' : 'Użytkownik';
                profileModal.classList.remove('hidden');
            }
        });
    } else {
        const unauthDiv = document.createElement('div');
        unauthDiv.style.display = 'flex';
        unauthDiv.style.gap = '10px';
        unauthDiv.innerHTML = `
            <button id="dynamic-btn-login" class="btn-outline">Zaloguj</button>
            <button id="dynamic-btn-register" class="btn-primary">Zarejestruj</button>
        `;
        authContainer.appendChild(unauthDiv);

        document.getElementById('dynamic-btn-login').addEventListener('click', () => {
            const loginModal = document.getElementById('login-modal');
            if (loginModal) loginModal.classList.remove('hidden');
        });
        
        document.getElementById('dynamic-btn-register').addEventListener('click', () => {
            const regModal = document.getElementById('register-modal');
            if (regModal) regModal.classList.remove('hidden');
        });
    }
}

function toggleAdminMode() {
    const adminSection = document.getElementById('admin-section');
    if (adminSection) adminSection.style.display = isAdmin ? 'block' : 'none';
    
    const commentForm = document.getElementById('add-comment-form');
    const loginPrompt = document.getElementById('login-prompt-comments');
    if (commentForm && loginPrompt) {
        if (currentUser) {
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

    if (bookForm) {
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
    }

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const filtered = books.filter(b => 
                b.title.toLowerCase().includes(term) || 
                b.author.toLowerCase().includes(term)
            );
            renderBooks(filtered);
        });
    }

    if (commentForm) {
        commentForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (!currentBookId) return;

            const ratingInput = commentForm.querySelector('input[name="rating"]:checked');
            const ratingValue = ratingInput ? Number(ratingInput.value) : 0;
            const textValue = document.getElementById('comment-text').value;
            const authorName = currentUser ? currentUser.name : "Użytkownik";

            const commentData = {
                rating: ratingValue,
                text: textValue,
                author: authorName
            };

            try {
                const response = await fetch(`${API_URL}/${currentBookId}/comments`, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(commentData)
                });

                if (!response.ok) {
                    const errDetails = await response.text();
                    console.error(errDetails);
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const res = await fetch(API_URL);
                books = await res.json();
                renderBooks();
                
                const freshBook = books.find(b => b.id == currentBookId);
                if (freshBook) {
                    renderComments(freshBook.comments || []);
                }

                commentForm.reset(); 
                showToast('Komentarz został zapisany!', 'success');

            } catch (err) {
                console.error(err);
                showToast('Błąd podczas zapisywania komentarza!', 'error');
            }
        });
    }
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
        if (coverImg) coverImg.src = book.coverUrl ? book.coverUrl : 'img/book.png';
        renderComments(book.comments || []);
        document.getElementById('book-modal')?.classList.remove('hidden');
    }
}

function renderComments(comments) {
    const list = document.getElementById('comments-list');
    if (!list || comments.length === 0) {
        if (list) list.innerHTML = '<p style="color: var(--text-muted); font-size: 0.9rem;">Brak komentarzy. Bądź pierwszy!</p>';
        return;
    }
    list.innerHTML = comments.map(c => {
        let stars = "";
        if (c.rating && !isNaN(c.rating)) stars = "⭐".repeat(Number(c.rating));
        else if (typeof c.rating === 'string' && c.rating.includes('⭐')) stars = c.rating;
        
        return `
        <div class="comment">
            <div class="comment-header">
                <strong>${c.author}</strong>
                <span style="font-size: 0.8rem;">${stars}</span>
            </div>
            <p>${c.text}</p>
        </div>
    `}).join('');
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
