// Authentication Handler for Login and Registration System
// Uses localStorage for persistent data storage

// Initialize default users if not exists
function initializeUsers() {
    const defaultUsers = {
        'student@chitkara.edu.in': {
            username: 'student',
            password: 'Student@123',
            name: 'Student User',
            role: 'student'
        },
        'admin@chitkara.edu.in': {
            username: 'admin',
            password: 'Admin@123',
            name: 'Admin User',
            role: 'admin'
        }
    };
    
    // Load existing users or create default ones
    const existingUsers = localStorage.getItem('users');
    if (!existingUsers) {
        localStorage.setItem('users', JSON.stringify(defaultUsers));
    }
}

// Get all users from localStorage
function getUsers() {
    const users = localStorage.getItem('users');
    return users ? JSON.parse(users) : {};
}

// Save users to localStorage
function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}

// Get current session from localStorage
function getCurrentSession() {
    const session = localStorage.getItem('currentSession');
    return session ? JSON.parse(session) : null;
}

// Save current session to localStorage
function saveCurrentSession(session) {
    if (session) {
        localStorage.setItem('currentSession', JSON.stringify(session));
    } else {
        localStorage.removeItem('currentSession');
    }
}

// Initialize authentication system when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Initialize users database
    initializeUsers();
    
    // Detect which page we're on
    const currentPage = window.location.pathname.split('/').pop();
    
    if (currentPage.toLowerCase().includes('login') || currentPage === 'LOGINfinal.html') {
        initLoginPage();
    } else if (currentPage.toLowerCase().includes('register')) {
        initRegisterPage();
    }
    
    // Check for existing session
    checkExistingSession();
});

// Initialize Login Page
function initLoginPage() {
    console.log('Initializing login page...');
    
    // Load remember me data
    loadRememberMe();
    
    // Add event listener to the submit button
    const submitBtn = document.querySelector('input[value="SUBMIT"]');
    if (submitBtn) {
        submitBtn.addEventListener('click', handleLogin);
    }
    
    // Add form submission handler
    const form = document.querySelector('.form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            handleLogin(e);
        });
    }
    
    // Add Enter key handler for password field
    const passwordField = document.getElementById('password');
    if (passwordField) {
        passwordField.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleLogin(e);
            }
        });
    }
}

// Initialize Register Page
function initRegisterPage() {
    console.log('Initializing register page...');
    
    // Add event listener to the register button
    const registerBtn = document.querySelector('input[value="REGISTER"]');
    if (registerBtn) {
        registerBtn.addEventListener('click', handleRegistration);
    }
    
    // Add form submission handler
    const form = document.querySelector('.form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            handleRegistration(e);
        });
    }
    
    // Add real-time password validation
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    if (passwordInputs.length >= 2) {
        passwordInputs[1].addEventListener('input', function() {
            validatePasswordMatch();
        });
    }
}

// Handle login process
function handleLogin(e) {
    e.preventDefault();
    
    // Get form values
    const email = document.getElementById('Email').value.trim();
    const password = document.getElementById('password').value;
    const rememberMe = document.querySelector('.checkbox') ? document.querySelector('.checkbox').checked : false;
    
    // Validate inputs
    if (!email) {
        showError('Please enter your email address');
        return false;
    }
    
    if (!validateEmail(email)) {
        showError('Please enter a valid email address');
        return false;
    }
    
    if (!password) {
        showError('Please enter your password');
        return false;
    }
    
    // Authenticate user
    const users = getUsers();
    if (authenticateUser(email, password, users)) {
        // Store session data in localStorage
        const sessionData = {
            email: email,
            username: users[email].username,
            name: users[email].name,
            role: users[email].role,
            loginTime: new Date().toISOString(),
            rememberMe: rememberMe
        };
        
        saveCurrentSession(sessionData);
        
        // Handle remember me
        if (rememberMe) {
            localStorage.setItem('rememberedEmail', email);
            console.log('Remember me enabled for:', email);
        } else {
            localStorage.removeItem('rememberedEmail');
        }
        
        showSuccess('Login successful! Redirecting...');
        
        // Redirect after short delay
        setTimeout(function() {
            window.location.href = './index.html';
        }, 1500);
        
        return true;
    } else {
        showError('Invalid email or password');
        // Clear password field
        document.getElementById('password').value = '';
        return false;
    }
}

// Handle registration process
function handleRegistration(e) {
    e.preventDefault();
    
    // Get form values
    const username = document.getElementById('Username').value.trim();
    const email = document.getElementById('Email').value.trim();
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    const password = passwordInputs[0].value;
    const confirmPassword = passwordInputs[1].value;
    
    // Validate all fields
    if (!username) {
        showError('Please enter a username');
        return false;
    }
    
    if (username.length < 3) {
        showError('Username must be at least 3 characters long');
        return false;
    }
    
    if (!email) {
        showError('Please enter your email address');
        return false;
    }
    
    if (!validateEmail(email)) {
        showError('Please enter a valid email address');
        return false;
    }
    
    // Get existing users
    const users = getUsers();
    
    // Check if email already exists
    if (users[email]) {
        showError('This email is already registered. Please login instead.');
        return false;
    }
    
    // Check if username already exists
    const usernameExists = Object.values(users).some(user => user.username === username);
    if (usernameExists) {
        showError('This username is already taken. Please choose another.');
        return false;
    }
    
    if (!password) {
        showError('Please enter a password');
        return false;
    }
    
    if (!validatePassword(password)) {
        showError('Password must be at least 8 characters with uppercase, lowercase, and number');
        return false;
    }
    
    if (password !== confirmPassword) {
        showError('Passwords do not match');
        return false;
    }
    
    // Register new user in localStorage
    users[email] = {
        username: username,
        password: password,
        name: username,
        role: 'user',
        registeredAt: new Date().toISOString()
    };
    
    saveUsers(users);
    
    // Create session for new user
    const sessionData = {
        email: email,
        username: username,
        name: username,
        role: 'user',
        loginTime: new Date().toISOString(),
        rememberMe: false
    };
    
    saveCurrentSession(sessionData);
    
    showSuccess('Registration successful! Redirecting...');
    console.log('New user registered:', email);
    
    // Redirect to home page
    setTimeout(function() {
        window.location.href = './Home.html';
    }, 1500);
    
    return true;
}

// Authenticate user credentials
function authenticateUser(email, password, users) {
    if (users[email]) {
        return users[email].password === password;
    }
    return false;
}

// Validate email format
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Validate password strength
function validatePassword(password) {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const minLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    
    return minLength && hasUpper && hasLower && hasNumber;
}

// Validate password match in real-time
function validatePasswordMatch() {
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    if (passwordInputs.length >= 2) {
        const password = passwordInputs[0].value;
        const confirmPassword = passwordInputs[1].value;
        
        if (confirmPassword.length > 0) {
            if (password === confirmPassword) {
                passwordInputs[1].style.borderColor = '#4CAF50';
            } else {
                passwordInputs[1].style.borderColor = '#f44336';
            }
        } else {
            passwordInputs[1].style.borderColor = '';
        }
    }
}

// Check for existing session
function checkExistingSession() {
    const session = getCurrentSession();
    if (session) {
        console.log('Active session found:', session.email);
        
        // Optionally auto-redirect if already logged in
        const currentPage = window.location.pathname.split('/').pop();
        if (currentPage.toLowerCase().includes('login') || currentPage.toLowerCase().includes('register')) {
            // Uncomment below to enable auto-redirect for logged-in users
            // showSuccess('You are already logged in. Redirecting...');
            // setTimeout(() => window.location.href = './Home.html', 1500);
        }
    }
}

// Load remember me preference
function loadRememberMe() {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
        const emailField = document.getElementById('Email');
        const checkbox = document.querySelector('.checkbox');
        
        if (emailField) {
            emailField.value = rememberedEmail;
        }
        if (checkbox) {
            checkbox.checked = true;
        }
    }
}

// Show error message
function showError(message) {
    removeAlerts();
    
    const alert = document.createElement('div');
    alert.className = 'auth-alert error';
    alert.innerHTML = `
        <span class="alert-icon">⚠️</span>
        <span class="alert-message">${message}</span>
    `;
    alert.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: #f44336;
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
        font-family: calibri, sans-serif;
        display: flex;
        align-items: center;
        gap: 10px;
        max-width: 350px;
    `;
    
    document.body.appendChild(alert);
    
    setTimeout(() => alert.remove(), 4000);
}

// Show success message
function showSuccess(message) {
    removeAlerts();
    
    const alert = document.createElement('div');
    alert.className = 'auth-alert success';
    alert.innerHTML = `
        <span class="alert-icon">✓</span>
        <span class="alert-message">${message}</span>
    `;
    alert.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: #4CAF50;
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
        font-family: calibri, sans-serif;
        display: flex;
        align-items: center;
        gap: 10px;
        max-width: 350px;
    `;
    
    document.body.appendChild(alert);
    
    setTimeout(() => alert.remove(), 4000);
}

// Remove existing alerts
function removeAlerts() {
    const existingAlerts = document.querySelectorAll('.auth-alert');
    existingAlerts.forEach(alert => alert.remove());
}

// Logout function (can be called from other pages)
function logout() {
    saveCurrentSession(null);
    // Optionally clear remember me
    // localStorage.removeItem('rememberedEmail');
    window.location.href = './login.html';
}

// Check if user is authenticated (can be called from other pages)
function isAuthenticated() {
    return getCurrentSession() !== null;
}

// Get current user data (can be called from other pages)
function getCurrentUser() {
    return getCurrentSession();
}

// Get all registered users (for admin purposes)
function getAllUsers() {
    const users = getUsers();
    return Object.keys(users).map(email => ({
        email: email,
        username: users[email].username,
        role: users[email].role
    }));
}

// Clear all data (for testing/reset purposes)
function clearAllData() {
    localStorage.removeItem('users');
    localStorage.removeItem('currentSession');
    localStorage.removeItem('rememberedEmail');
    initializeUsers();
    console.log('All data cleared and reset to defaults');
}

// Export functions for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        logout,
        isAuthenticated,
        getCurrentUser,
        getAllUsers,
        clearAllData
    };
}