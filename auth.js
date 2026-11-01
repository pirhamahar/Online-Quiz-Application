// auth.js - theme toggle, login, register, forgot password

// ---------- Theme (light / dark) ----------
const initTheme = () => {
    const themeToggle = document.getElementById('themeToggle');

    // Read the saved theme, default is light
    const currentTheme = localStorage.getItem('theme') || 'light';

    // Apply it to the page and set the button icon
    document.documentElement.setAttribute('data-theme', currentTheme);
    themeToggle.textContent = currentTheme === 'dark' ? '☀️' : '🌙';

    // Switch theme when the button is clicked
    themeToggle.addEventListener('click', () => {
        const theme = document.documentElement.getAttribute('data-theme');
        const newTheme = theme === 'light' ? 'dark' : 'light';

        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);   // remember the choice
        themeToggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';
    });
};

// Run when the page has loaded
document.addEventListener('DOMContentLoaded', initTheme);

// Simple email check used by all forms
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ---------- Login ----------
if (document.getElementById('loginForm')) {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();   // stop the page from reloading

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        // Check the inputs before calling Firebase
        if (!emailRegex.test(email)) {
            showError('Please enter a valid email address');
            return;
        }
        if (password.length < 6) {
            showError('Password must be at least 6 characters');
            return;
        }

        // Disable the button while we wait
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Logging in...';
        submitBtn.disabled = true;

        try {
            // Sign in with Firebase Auth
            await auth.signInWithEmailAndPassword(email, password);

            // Go to the home page
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Login error:', error);

            // Turn Firebase error codes into friendly messages
            let message = 'Login failed. Please try again.';
            switch (error.code) {
                case 'auth/user-not-found':
                    message = 'No account found with this email.';
                    break;
                case 'auth/wrong-password':
                case 'auth/invalid-credential':   // newer Firebase projects use this one
                    message = 'Incorrect email or password.';
                    break;
                case 'auth/invalid-email':
                    message = 'Invalid email address.';
                    break;
                case 'auth/user-disabled':
                    message = 'This account has been disabled.';
                    break;
                case 'auth/too-many-requests':
                    message = 'Too many failed attempts. Please try again later.';
                    break;
            }

            showError(message);
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });

    // Show a red error box for 5 seconds
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.add('show');
        errorMessage.style.display = 'block';

        setTimeout(() => {
            errorMessage.classList.remove('show');
        }, 5000);
    }
}

// ---------- Register ----------
if (document.getElementById('registerForm')) {
    const registerForm = document.getElementById('registerForm');
    const errorMessage = document.getElementById('errorMessage');

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // Validate the form
        if (name.length < 2) {
            showError('Name must be at least 2 characters');
            return;
        }
        if (!emailRegex.test(email)) {
            showError('Please enter a valid email address');
            return;
        }
        if (password.length < 6) {
            showError('Password must be at least 6 characters');
            return;
        }
        if (password !== confirmPassword) {
            showError('Passwords do not match');
            return;
        }

        // Disable the button while we wait
        const submitBtn = registerForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Creating account...';
        submitBtn.disabled = true;

        try {
            // Create the account in Firebase Auth
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;

            // Save the extra user details in Firestore (users collection)
            await db.collection('users').doc(user.uid).set({
                name: name,
                email: email,
                uid: user.uid,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            // Also store the name on the Auth profile
            await user.updateProfile({
                displayName: name
            });

            // Go to the home page
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Registration error:', error);

            // Turn Firebase error codes into friendly messages
            let message = 'Registration failed. Please try again.';
            switch (error.code) {
                case 'auth/email-already-in-use':
                    message = 'This email is already registered. Please login instead.';
                    break;
                case 'auth/invalid-email':
                    message = 'Invalid email address.';
                    break;
                case 'auth/weak-password':
                    message = 'Password is too weak. Use a stronger password.';
                    break;
                case 'auth/operation-not-allowed':
                    message = 'Registration is currently disabled.';
                    break;
            }

            showError(message);
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.add('show');
        errorMessage.style.display = 'block';

        setTimeout(() => {
            errorMessage.classList.remove('show');
        }, 5000);
    }
}

// ---------- Forgot password ----------
if (document.getElementById('forgotPasswordForm')) {
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');

    forgotPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value.trim();

        if (!emailRegex.test(email)) {
            showForgotPasswordError('Please enter a valid email address');
            return;
        }

        const submitBtn = forgotPasswordForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;

        try {
            // Firebase emails the reset link
            await auth.sendPasswordResetEmail(email);
            showForgotPasswordSuccess('Password reset link sent to your email. Check your inbox!');
            forgotPasswordForm.reset();

            // Back to login after 3 seconds
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 3000);

        } catch (error) {
            console.error('Password reset error:', error);

            let message = 'Failed to send reset email. Please try again.';
            switch (error.code) {
                case 'auth/user-not-found':
                    message = 'No account found with this email address.';
                    break;
                case 'auth/invalid-email':
                    message = 'Invalid email address format.';
                    break;
                case 'auth/too-many-requests':
                    message = 'Too many requests. Please try again later.';
                    break;
                case 'auth/network-request-failed':
                    message = 'Network error. Please check your connection.';
                    break;
            }

            showForgotPasswordError(message);
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });

    function showForgotPasswordError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.add('show');
        errorMessage.style.display = 'block';
        successMessage.style.display = 'none';

        setTimeout(() => {
            errorMessage.classList.remove('show');
        }, 5000);
    }

    function showForgotPasswordSuccess(message) {
        successMessage.textContent = message;
        successMessage.classList.add('show');
        successMessage.style.display = 'block';
        errorMessage.style.display = 'none';
    }
}

// ---------- Keep logged-in users away from login/register ----------
auth.onAuthStateChanged((user) => {
    const isAuthPage = window.location.pathname.includes('login.html') ||
                       window.location.pathname.includes('register.html');

    if (user && isAuthPage) {
        window.location.href = 'index.html';
    }
});
