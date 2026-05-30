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
    setupAuthListeners();
    setupBooksListeners();
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
            const sum = book.comments.reduce((acc, curr) => acc + (curr.rating ? curr.rating.length : 0), 0);
            avgRating = "⭐".repeat(Math.round(sum / book.comments.length));
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
    
    const closeLogin = document.getElementById('close-login-modal');
    const closeRegister = document.getElementById('close-register-modal');
    
    if (closeLogin) closeLogin.addEventListener('click', () => loginModal.classList.add('hidden'));
    if (closeRegister) closeRegister.addEventListener('click', () => registerModal.classList.add('hidden'));

    const switchToRegister = document.getElementById('switch-to-register');
    const switchToLogin = document.getElementById('switch-to-login');

    if (switchToRegister) {
        switchToRegister.addEventListener('click', () => {
            loginModal.classList.add('hidden');
            registerModal.classList.remove('hidden');
        });
    }

    if (switchToLogin) {
        switchToLogin.addEventListener('click', () => {
            registerModal.classList.add('hidden');
            loginModal.classList.remove('hidden');
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault(); 
            const email = loginForm.querySelector('input[type="email"]').value;
            if(email === 'admin@admin.com') {
                isAdmin = true;
                currentUser = { name: 'Administrator', email: email };
                showToast('Zalogowano pomyślnie jako Administrator!', 'success');
            } else {
                isAdmin = false;
                const nameFromEmail = email.split('@')[0];
                currentUser = { name: nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1), email: email };
                showToast('Zalogowano pomyślnie!', 'success');
            }
            loginModal.classList.add('hidden');
            loginForm.reset();
            updateAuthUI();
            toggleAdminMode();
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault(); 
            const inputs = registerForm.querySelectorAll('input');
            const name = inputs[0].value;
            const email = inputs[1].value;
            isAdmin = false;
            currentUser = { name: name, email: email };
            registerModal.classList.add('hidden');
            registerForm.reset();
            updateAuthUI();
            toggleAdminMode();
            showToast('Konto utworzone. Zostałeś automatycznie zalogowany!', 'success');
        });
    }

    const closeProfileModal = document.getElementById('close-profile-modal');
    const profileModal = document.getElementById('profile-modal');
    if (closeProfileModal && profileModal) {
        closeProfileModal.addEventListener('click', () => {
            profileModal.classList.add('hidden');
        });
    }
}

function updateAuthUI() {
    const authContainers = document.querySelectorAll('.auth-buttons');
    
    authContainers.forEach(container => {
        Array.from(container.children).forEach(child => {
            if (child.id !== 'theme-toggle') {
                child.remove();
            }
        });

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
            container.appendChild(authDiv);

            document.getElementById('dynamic-btn-logout').addEventListener('click', () => {
                currentUser = null;
                isAdmin = false;
                updateAuthUI();
                toggleAdminMode();
                showToast('Wylogowano pomyślnie.', 'warning');
            });

            document.getElementById('dynamic-btn-profile').addEventListener('click', () => {
                const profileModal = document.getElementById('profile-modal');
                if(profileModal) {
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
            container.appendChild(unauthDiv);

            document.getElementById('dynamic-btn-login').addEventListener('click', () => {
                const loginModal = document.getElementById('login-modal');
                if (loginModal) loginModal.classList.remove('hidden');
            });

            document.getElementById('dynamic-btn-register').addEventListener('click', () => {
                const regModal = document.getElementById('register-modal');
                if (regModal) regModal.classList.remove('hidden');
            });
        }
    });
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

    commentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        e.target.reset(); 
        showToast('Komentarz został dodany!', 'success');
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
    if (!list || comments.length === 0) return;
    list.innerHTML = comments.map(c => `
        <div class="comment">
            <div class="comment-header"><strong>${c.author}</strong></div>
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
