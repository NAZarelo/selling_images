// =====================================================================================
// 0. БАЗА ДАНИХ
// =====================================================================================
window.imagesDB = JSON.parse(localStorage.getItem("imagesDB")) || [];
window.usersDB = JSON.parse(localStorage.getItem("usersDB")) || [];
window.currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;

// =====================================================================================
// ЗБЕРЕЖЕННЯ
// =====================================================================================
function saveImagesDB() {
    localStorage.setItem("imagesDB", JSON.stringify(window.imagesDB));
}

function saveUsersDB() {
    localStorage.setItem("usersDB", JSON.stringify(window.usersDB));
}

function saveCurrentUser() {
    localStorage.setItem("currentUser", JSON.stringify(window.currentUser));
}

// =====================================================================================
// РЕНДЕР ГАЛЕРЕЇ
// =====================================================================================
function renderImages(list) {
    const gallery = document.querySelector(".gallery-container");
    if (!gallery) return;

    gallery.innerHTML = "";

    if (list.length === 0) {
        gallery.innerHTML = "<p>Нічого не знайдено.</p>";
        return;
    }

    list.forEach((img, index) => {
        const card = document.createElement("div");
        card.className = "image-card";

        let deleteBtn = "";

        if (window.currentUser && (window.currentUser.role === "admin" || window.currentUser.role === "mainAdmin")) {
            deleteBtn = `<button class="delete-image-btn" data-id="${index}">Видалити</button>`;
        }

        card.innerHTML = `
            <div class="image-for-sale-card">
                <img class="image-for-sale" src="${img.src}" alt="${img.title}">
                <h3>${img.title}</h3>
                <p>Категорія: ${img.category}</p>
                <p>Тип: ${img.type === "free" ? "Безкоштовне" : "Платне"}</p>
                <p>Ціна ${img.price}</p>
                <a class="btn-menu-home" href="${img.url || img.src}" download>Завантажити</a>
            </div>
        `;

        gallery.appendChild(card);
    });

    document.querySelectorAll(".delete-image-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const id = btn.dataset.id;
            window.imagesDB.splice(id, 1);
            saveImagesDB();
            renderImages(list);
        });
    });
}

// =====================================================================================
// ФІЛЬТРИ
// =====================================================================================
function loadPageImages(type, category) {
    renderImages(window.imagesDB.filter(img => img.type === type && img.category === category));
}
function loadAllFree() { renderImages(window.imagesDB.filter(img => img.type === "free")); }
function loadAllPaid() { renderImages(window.imagesDB.filter(img => img.type === "paid")); }

// =====================================================================================
// DOM READY
// =====================================================================================
document.addEventListener("DOMContentLoaded", () => {
    const page = document.body.dataset.page;
    let accountblock = document.querySelector('.account-block');

    // ==========================
    // Відображення акаунта
    // ==========================
    if (accountblock) {
        if (!window.currentUser) {
            accountblock.innerHTML = `
                <a class="login-register-but" href="login.html">Увійти</a>
                <a class="login-register-but" href="register.html">Зареєструватись</a>
            `;
        } else {
            accountblock.innerHTML = `
                <h2>Ви: ${window.currentUser.username}</h2>
                <p>Роль: ${window.currentUser.role}</p>
                <button class="change-pas-btn">змінити пароль</button><br>
                <button class="logout-btn">Вийти</button>
            `;
        }
    }

    // ==========================
    // Захист create.html
    // ==========================
    if (page === "create" && !window.currentUser) {
        alert("Будь ласка, увійдіть, щоб додавати зображення.");
        window.location.href = "login.html";
        return;
    }

    // ==========================
    // Авто-завантаження сторінок
    // ==========================
    switch (page) {
        case "free-icons": loadPageImages("free", "icons"); break;
        case "free-wallpaper": loadPageImages("free", "wallpaper"); break;
        case "free-images": loadPageImages("free", "images"); break;
        case "free-all": loadAllFree(); break;
        case "paid-icons": loadPageImages("paid", "icons"); break;
        case "paid-wallpaper": loadPageImages("paid", "wallpaper"); break;
        case "paid-images": loadPageImages("paid", "images"); break;
        case "paid-all": loadAllPaid(); break;
    }

    // =================================================================================
    // LOGIN
    // =================================================================================
    const loginForm = document.querySelector("#loginForm");

    if (loginForm) {
        loginForm.addEventListener("submit", e => {
            e.preventDefault();
            const username = loginForm.username.value.trim();
            const password = loginForm.password.value;

            const user = window.usersDB.find(u => u.username === username && u.password === password);

            if (!user) return alert("Невірний логін або пароль.");

            window.currentUser = {
                username: user.username,
                role: user.role
            };

            saveCurrentUser();
            alert("Вхід успішний!");
            window.location.href = "index.html";
        });
    }

    // =================================================================================
    // REGISTER
    // =================================================================================
    const registerForm = document.querySelector("#registerForm");

    if (registerForm) {
        registerForm.addEventListener("submit", e => {
            e.preventDefault();

            const username = registerForm.username.value.trim();
            const password = registerForm.password.value;

            if (window.usersDB.find(u => u.username === username)) {
                return alert("Такий користувач вже існує.");
            }

            let role = "user";

            if (username === "naz") role = "mainAdmin";

            window.usersDB.push({ username, password, role });
            saveUsersDB();

            alert("Реєстрація успішна!");
            window.location.href = "login.html";
        });
    }

    // =================================================================================
    // ВИХІД
    // =================================================================================
    const logoutBtn = document.querySelector(".logout-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("currentUser");
            window.location.reload();
        });
    }

    // =================================================================================
    // ЗМІНА ПАРОЛЮ
    // =================================================================================
    const changePas = document.querySelector(".change-pas");
    const changePasBtn = document.querySelector(".change-pas-btn");
    const changePasForm = document.querySelector("#changePasForm");
    const changePasBtnCancel = document.querySelector(".change-pas-button-c");

    if (changePas) changePas.style.display = "none";

    if (changePasBtn) {
        changePasBtn.addEventListener("click", () => changePas.style.display = "block");
    }

    if (changePasBtnCancel) {
        changePasBtnCancel.addEventListener("click", () => changePas.style.display = "none");
    }

    if (changePasForm) {
        changePasForm.addEventListener("submit", e => {
            e.preventDefault();

            const oldPass = changePasForm.oldPas.value;
            const newPass = changePasForm.newPas.value;

            const user = window.usersDB.find(u => u.username === window.currentUser.username);

            if (!user) return alert("Користувача не знайдено.");
            if (user.password !== oldPass) return alert("Старий пароль невірний.");

            user.password = newPass;
            saveUsersDB();

            alert("Пароль змінено!");
            changePas.style.display = "none";
        });
    }

    // =================================================================================
    // CREATE.HTML – додавання зображення
    // =================================================================================
    const createForm = document.querySelector(".create-form");

    if (createForm) {
        const fileInput = document.getElementById("imageFile");
        const preview = document.getElementById("previewImage");
        const typeSelect = document.getElementById("type");
        const priceInput = document.getElementById("price");

        // Показ/приховування ціни
        if (typeSelect && priceInput) {
            function togglePrice() {
                if (typeSelect.value === "free") {
                    priceInput.style.display = "none";
                } else {
                    priceInput.style.display = "block";
                }
            }
            typeSelect.addEventListener("change", togglePrice);
            togglePrice();
        }

        if (fileInput && preview) {
            fileInput.addEventListener("change", () => {
                const file = fileInput.files[0];
                if (!file) return (preview.style.display = "none");

                const reader = new FileReader();
                reader.onload = e => {
                    preview.src = e.target.result;
                    preview.style.display = "block";
                };
                reader.readAsDataURL(file);
            });
        }

        createForm.addEventListener("submit", e => {
            e.preventDefault();

            const file = fileInput.files[0];
            if (!file) return alert("Завантажте файл.");

            const reader = new FileReader();
            reader.onload = e => {
                const newImage = {
                    src: e.target.result,
                    title: createForm.title.value,
                    category: createForm.category.value,
                    type: createForm.type.value,
                    price: createForm.type.value === "paid" ? priceInput.value : 0
                };

                window.imagesDB.push(newImage);
                saveImagesDB();
                alert("Зображення додано!");
                createForm.reset();
                preview.style.display = "none";
                togglePrice();
            };

            reader.readAsDataURL(file);
        });
    }
});

// ======================= АДМІНКА =======================
let adminLink = document.querySelector('.adminLink');
if (adminLink) {
    if (window.currentUser && (window.currentUser.role === "admin" || window.currentUser.role === "mainAdmin")) {
        adminLink.style.display = 'block';
    } else {
        adminLink.style.display = 'none';
    }
}

// ======================= ФУНКЦІЇ АДМІНКИ =======================
function adminDeleteImage(index) {
    if (!window.currentUser || (window.currentUser.role !== "admin" && window.currentUser.role !== "mainAdmin")) return;
    window.imagesDB.splice(index, 1);
    saveImagesDB();
    window.location.reload();
}

function adminDeleteUser(username) {
    if (!window.currentUser) return;
    const user = window.usersDB.find(u => u.username === username);
    if (!user) return;

    if (user.role === "mainAdmin" && window.currentUser.role !== "mainAdmin") {
        alert("Ви не можете видалити головного адміністратора!");
        return;
    }

    const confirmDelete = confirm(`Видалити користувача ${username}?`);
    if (!confirmDelete) return;

    const idx = window.usersDB.findIndex(u => u.username === username);
    if (idx !== -1) {
        window.usersDB.splice(idx, 1);
        saveUsersDB();
        if (window.currentUser.username === username) {
            localStorage.removeItem("currentUser");
        }
        window.location.reload();
    }
}

function giveAdmin(username) {
    if (!window.currentUser || window.currentUser.role !== "mainAdmin") return;
    const user = window.usersDB.find(u => u.username === username);
    if (user) {
        user.role = "admin";
        saveUsersDB();
        window.location.reload();
    }
}

function removeAdmin(username) {
    if (!window.currentUser || window.currentUser.role !== "mainAdmin") return;
    const user = window.usersDB.find(u => u.username === username);
    if (user && user.role === "admin") {
        user.role = "user";
        saveUsersDB();
        window.location.reload();
    }
}

// =====================================================================================
// АДМІНКА — РЕНДЕР ПАНЕЛІ
// =====================================================================================
document.addEventListener("DOMContentLoaded", () => {
    const page = document.body.dataset.page;
    if (page !== "admin") return;

    // Перевірка доступу
    if (!window.currentUser || (window.currentUser.role !== "admin" && window.currentUser.role !== "mainAdmin")) {
        alert("У вас немає доступу.");
        window.location.href = "index.html";
        return;
    }

    // ======================= ЗОБРАЖЕННЯ =======================
    const imgBox = document.getElementById("admin-images");

    imgBox.innerHTML = window.imagesDB.map((img, i) => `
        <div class="admin-item">
            <img src="${img.src}" style="width:120px;">
            <p>${img.title}</p>
            <button onclick="adminDeleteImage(${i})">Видалити</button>
        </div>
    `).join("");

    // ======================= ПОШУК ЗОБРАЖЕННЯ =======================
    const imgSearchBox = document.getElementById("admin-images-search");

    imgSearchBox.innerHTML = `
    <input id="admin-img-search-input" placeholder="Введіть назву...">
    <div id="admin-img-search-result"></div>
`;

    const imgSearchInput = document.getElementById("admin-img-search-input");
    const imgSearchResult = document.getElementById("admin-img-search-result");

    imgSearchInput.addEventListener("input", () => {
        const q = imgSearchInput.value.toLowerCase();

        const results = window.imagesDB.filter(img =>
            img.title.toLowerCase().includes(q)
        );

        imgSearchResult.innerHTML = results
            .map((img, i) => `
            <div class="admin-item">
                <img src="${img.src}" style="width:120px;">
                <p>${img.title}</p>
                <button onclick="adminDeleteImage(${i})">Видалити</button>
            </div>
        `)
            .join("") || "<p>Нічого не знайдено.</p>";
    });


    // ======================= КОРИСТУВАЧІ =======================
    const usersBox = document.getElementById("admin-users");

    usersBox.innerHTML = window.usersDB.map(u => {
        let buttons = `<button onclick="adminDeleteUser('${u.username}')">Видалити</button>`;

        if (window.currentUser.role === "mainAdmin") {
            if (u.role === "user") {
                buttons += `<button onclick="giveAdmin('${u.username}')">Зробити адміном</button>`;
            }
            if (u.role === "admin") {
                buttons += `<button onclick="removeAdmin('${u.username}')">Забрати роль адміна</button>`;
            }
        }

        return `
            <div class="admin-item">
                <p>${u.username} (${u.role})</p>
                ${buttons}
            </div>
        `;
    }).join("");

    
// ======================= ПОШУК КОРИСТУВАЧІВ =======================
const userSearchBox = document.getElementById("admin-users-search");

userSearchBox.innerHTML = `
    <input id="admin-user-search-input" placeholder="Введіть ім'я користувача...">
    <div id="admin-user-search-result"></div>
`;

const userSearchInput = document.getElementById("admin-user-search-input");
const userSearchResult = document.getElementById("admin-user-search-result");

userSearchInput.addEventListener("input", () => {
    const q = userSearchInput.value.toLowerCase();

    const results = window.usersDB.filter(u =>
        u.username.toLowerCase().includes(q)
    );

    userSearchResult.innerHTML = results
        .map(u => {
            let buttons = `<button onclick="adminDeleteUser('${u.username}')">Видалити</button>`;

            if (window.currentUser.role === "mainAdmin") {
                if (u.role === "user") {
                    buttons += `<button onclick="giveAdmin('${u.username}')">Зробити адміном</button>`;
                }
                if (u.role === "admin") {
                    buttons += `<button onclick="removeAdmin('${u.username}')">Забрати роль адміна</button>`;
                }
            }

            return `
                <div class="admin-item">
                    <p>${u.username} (${u.role})</p>
                    ${buttons}
                </div>
            `;
        })
        .join("") || "<p>Нічого не знайдено.</p>";
});

});
