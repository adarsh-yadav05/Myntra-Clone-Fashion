// Myntra Clone Authentication Script
// Created by: Antigravity AI
// Description: Handle signup validation, password strength indicators, mock database in local storage, and page transitions.

document.addEventListener("DOMContentLoaded", function() {
    console.log("Auth script initialized!");

    // 1. Theme Synchronization
    initTheme();

    // 2. Tab switching logic
    initTabs();

    // 3. Password visibility toggle
    initPasswordVisibility();

    // 4. Password strength meter
    initPasswordStrength();

    // 5. Form Submissions
    initFormHandlers();

    // 6. Check for saved credentials (Remember Me)
    checkSavedCredentials();

    // 7. Check url query parameters to switch default tab
    checkUrlParams();
});

// --- Theme controls ---
function initTheme() {
    var themeToggle = document.getElementById("theme_toggle");
    
    // Check local storage for theme preference
    var savedTheme = localStorage.getItem("myntraTheme");
    if (savedTheme === "dark") {
        document.body.classList.add("dark-theme");
    } else {
        document.body.classList.remove("dark-theme");
    }

    themeToggle.addEventListener("click", function() {
        document.body.classList.toggle("dark-theme");
        var isDark = document.body.classList.contains("dark-theme");
        localStorage.setItem("myntraTheme", isDark ? "dark" : "light");
    });
}

// --- Tabs controls ---
function initTabs() {
    var tabs = document.querySelectorAll(".tab-btn");
    var indicator = document.getElementById("tab_indicator");
    var loginForm = document.getElementById("form_login");
    var signupForm = document.getElementById("form_signup");

    tabs.forEach(function(tab) {
        tab.addEventListener("click", function() {
            // Remove active classes
            tabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");

            // Move indicator line
            if (tab.id === "tab_signup") {
                indicator.style.transform = "translateX(100%)";
                loginForm.classList.remove("active");
                signupForm.classList.add("active");
            } else {
                indicator.style.transform = "translateX(0)";
                signupForm.classList.remove("active");
                loginForm.classList.add("active");
            }

            // Clear existing form errors when switching tabs
            clearAllErrors();
        });
    });
}

// --- Password Visibility Toggle ---
function initPasswordVisibility() {
    var toggles = document.querySelectorAll(".password-toggle");
    
    toggles.forEach(function(toggle) {
        toggle.addEventListener("click", function() {
            var targetId = toggle.getAttribute("data-target");
            var input = document.getElementById(targetId);
            var eyeOpen = toggle.querySelector(".eye-open");
            var eyeClosed = toggle.querySelector(".eye-closed");

            if (input.type === "password") {
                input.type = "text";
                eyeOpen.style.display = "none";
                eyeClosed.style.display = "block";
            } else {
                input.type = "password";
                eyeOpen.style.display = "block";
                eyeClosed.style.display = "none";
            }
        });
    });
}

// --- Password Strength Meter ---
function initPasswordStrength() {
    var passwordInput = document.getElementById("signup_password");
    var meterBar = document.getElementById("strength_bar");
    var meterText = document.getElementById("strength_text");

    passwordInput.addEventListener("input", function() {
        var val = passwordInput.value;
        var strength = 0;

        if (val.length === 0) {
            meterBar.style.width = "0%";
            meterBar.style.backgroundColor = "var(--border-color)";
            meterText.textContent = "Strength: None";
            return;
        }

        // Assessment Criteria
        if (val.length >= 4) strength++; // Min length
        if (/[A-Z]/.test(val) && /[a-z]/.test(val)) strength++; // Mixed Case
        if (/[0-9]/.test(val)) strength++; // Numbers
        if (/[^A-Za-z0-9]/.test(val)) strength++; // Special Characters

        // Update UI based on score
        if (strength <= 1) {
            meterBar.style.width = "25%";
            meterBar.style.backgroundColor = "var(--error-color)";
            meterText.textContent = "Strength: Weak 🔴";
        } else if (strength === 2) {
            meterBar.style.width = "50%";
            meterBar.style.backgroundColor = "#ff9800"; // Orange
            meterText.textContent = "Strength: Medium 🟡";
        } else if (strength === 3) {
            meterBar.style.width = "75%";
            meterBar.style.backgroundColor = "#2196f3"; // Blue
            meterText.textContent = "Strength: Good 🔵";
        } else if (strength === 4) {
            meterBar.style.width = "100%";
            meterBar.style.backgroundColor = "var(--success-color)";
            meterText.textContent = "Strength: Strong! 🟢";
        }
    });
}

// --- Form Submissions and Local Storage Authentication ---
function initFormHandlers() {
    var formLogin = document.getElementById("form_login");
    var formSignup = document.getElementById("form_signup");

    // LOGIN SUBMIT
    formLogin.addEventListener("submit", function(e) {
        e.preventDefault();
        clearAllErrors();

        var usernameVal = document.getElementById("login_username").value.trim();
        var passwordVal = document.getElementById("login_password").value;
        var rememberCheckbox = document.getElementById("login_remember").checked;
        var isValid = true;

        // Validation
        if (!usernameVal) {
            setError("login_username", "Please enter your Email or Mobile Number");
            isValid = false;
        }
        if (!passwordVal) {
            setError("login_password", "Please enter your password");
            isValid = false;
        } else if (passwordVal.length < 4 || passwordVal.length > 6) {
            setError("login_password", "Password must be between 4 and 6 characters");
            isValid = false;
        }

        if (!isValid) return;

        // Show spinner animation
        var btn = formLogin.querySelector(".auth-submit-btn");
        var btnText = btn.querySelector("span");
        var spinner = document.getElementById("login_spinner");
        
        btn.disabled = true;
        btnText.style.opacity = "0";
        spinner.style.display = "block";

        // Simulate network latency (1 sec)
        setTimeout(function() {
            // Check in Local Storage database
            var users = JSON.parse(localStorage.getItem("myntraUsers") || "[]");
            var matchedUser = null;

            for (var i = 0; i < users.length; i++) {
                var u = users[i];
                if ((u.email === usernameVal || u.mobile === usernameVal) && u.password === passwordVal) {
                    matchedUser = u;
                    break;
                }
            }

            // Also check default mock developer login for testing convenience
            if (!matchedUser && (usernameVal === "guest@myntraclone.com" || usernameVal === "9999999999") && passwordVal === "guest1") {
                matchedUser = { name: "Guest User", email: "guest@myntraclone.com", mobile: "9999999999" };
            }

            btn.disabled = false;
            btnText.style.opacity = "1";
            spinner.style.display = "none";

            if (matchedUser) {
                // Success! Set session
                localStorage.setItem("currentUser", JSON.stringify({
                    name: matchedUser.name,
                    email: matchedUser.email,
                    mobile: matchedUser.mobile
                }));

                // Handle Remember Me
                if (rememberCheckbox) {
                    localStorage.setItem("rememberedUser", usernameVal);
                } else {
                    localStorage.removeItem("rememberedUser");
                }

                showToast("Logged in successfully! Redirecting...", "success");
                
                setTimeout(function() {
                    window.location.href = "../index.html";
                }, 1200);
            } else {
                showToast("Invalid credentials. Try guest@myntraclone.com / guest1", "error");
                setError("login_password", "Please verify your password details");
                setError("login_username", "Please verify your username details");
            }
        }, 1000);
    });

    // SIGNUP SUBMIT
    formSignup.addEventListener("submit", function(e) {
        e.preventDefault();
        clearAllErrors();

        var name = document.getElementById("signup_name").value.trim();
        var email = document.getElementById("signup_email").value.trim();
        var mobile = document.getElementById("signup_mobile").value.trim();
        var password = document.getElementById("signup_password").value;
        var confirmPassword = document.getElementById("signup_confirm_password").value;
        var agree = document.getElementById("signup_agree").checked;
        
        var isValid = true;

        // Validations
        if (!name) {
            setError("signup_name", "Please enter your full name");
            isValid = false;
        } else if (name.length < 3) {
            setError("signup_name", "Name must be at least 3 characters");
            isValid = false;
        }

        if (!email) {
            setError("signup_email", "Please enter your email");
            isValid = false;
        } else if (!validateEmail(email)) {
            setError("signup_email", "Please enter a valid email format");
            isValid = false;
        }

        if (!mobile) {
            setError("signup_mobile", "Please enter your mobile number");
            isValid = false;
        } else if (!/^\d{10}$/.test(mobile)) {
            setError("signup_mobile", "Mobile number must be exactly 10 digits");
            isValid = false;
        }

        if (!password) {
            setError("signup_password", "Please create a password");
            isValid = false;
        } else if (password.length < 4 || password.length > 6) {
            setError("signup_password", "Password must be between 4 and 6 characters");
            isValid = false;
        }

        if (!confirmPassword) {
            setError("signup_confirm_password", "Please confirm your password");
            isValid = false;
        } else if (password !== confirmPassword) {
            setError("signup_confirm_password", "Passwords do not match");
            isValid = false;
        }

        if (!agree) {
            setError("signup_agree", "You must agree to the terms and privacy conditions");
            isValid = false;
        }

        if (!isValid) return;

        // Show spinner
        var btn = formSignup.querySelector(".auth-submit-btn");
        var btnText = btn.querySelector("span");
        var spinner = document.getElementById("signup_spinner");
        
        btn.disabled = true;
        btnText.style.opacity = "0";
        spinner.style.display = "block";

        setTimeout(function() {
            var users = JSON.parse(localStorage.getItem("myntraUsers") || "[]");

            // Check duplicate registration
            var isDuplicate = users.some(function(u) {
                return u.email === email || u.mobile === mobile;
            });

            btn.disabled = false;
            btnText.style.opacity = "1";
            spinner.style.display = "none";

            if (isDuplicate) {
                showToast("An account with this email/mobile already exists", "error");
                setError("signup_email", "Please use another email address");
                setError("signup_mobile", "Please use another mobile number");
                return;
            }

            // Create new record
            var newUser = {
                name: name,
                email: email,
                mobile: mobile,
                password: password,
                createdAt: new Date().toISOString()
            };

            users.push(newUser);
            localStorage.setItem("myntraUsers", JSON.stringify(users));

            // Automatically login new user
            localStorage.setItem("currentUser", JSON.stringify({
                name: newUser.name,
                email: newUser.email,
                mobile: newUser.mobile
            }));

            showToast("Registration successful! Logging you in...", "success");

            setTimeout(function() {
                window.location.href = "../index.html";
            }, 1200);

        }, 1200);
    });
}

// --- Utility Functions ---
function setError(inputId, message) {
    var errorSpan = document.getElementById("err_" + inputId);
    if (errorSpan) {
        errorSpan.textContent = message;
        errorSpan.classList.add("active");
    }
    
    // Highlight input boundary red
    var inputElement = document.getElementById(inputId);
    if (inputElement) {
        inputElement.style.borderColor = "var(--error-color)";
    }
}

function clearAllErrors() {
    var errorSpans = document.querySelectorAll(".error-msg");
    errorSpans.forEach(function(span) {
        span.textContent = "";
        span.classList.remove("active");
    });

    var inputs = document.querySelectorAll(".floating-input");
    inputs.forEach(function(input) {
        input.style.borderColor = "";
    });
}

function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

function checkSavedCredentials() {
    var savedUser = localStorage.getItem("rememberedUser");
    if (savedUser) {
        var input = document.getElementById("login_username");
        if (input) {
            input.value = savedUser;
            // Trigger floating label state by adding value placeholder check
            input.dispatchEvent(new Event("input"));
        }
        var rememberBox = document.getElementById("login_remember");
        if (rememberBox) {
            rememberBox.checked = true;
        }
    }
}

// --- Toast System ---
function showToast(message, type) {
    var container = document.getElementById("toast_container");
    if (!container) return;

    var toast = document.createElement("div");
    toast.className = "toast " + (type || "info");
    toast.innerHTML = `
        <span class="toast-message">${message}</span>
        <div class="toast-progress"></div>
    `;

    container.appendChild(toast);

    // Auto-remove toast after 3 seconds
    setTimeout(function() {
        toast.style.animation = "slide-in-toast 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) reverse forwards";
        setTimeout(function() {
            toast.remove();
        }, 300);
    }, 2700);
}

// --- Mock Social Authentication Trigger ---
function triggerSocialAuth(platform) {
    showToast("Connecting to " + platform + " API...", "info");
    
    setTimeout(function() {
        var mockUser = {
            name: platform + " Explorer",
            email: "partner_" + platform.toLowerCase() + "@myntraclone.com",
            mobile: "9000000000"
        };
        
        localStorage.setItem("currentUser", JSON.stringify(mockUser));
        showToast("Connected via " + platform + "! Welcome, " + mockUser.name + ".", "success");

        setTimeout(function() {
            window.location.href = "../index.html";
        }, 1200);
    }, 1200);
}

// Expose Platform Login triggering to Global window scope
window.triggerSocialAuth = triggerSocialAuth;

function checkUrlParams() {
    var params = new URLSearchParams(window.location.search);
    if (params.get("tab") === "signup") {
        var signupTab = document.getElementById("tab_signup");
        if (signupTab) signupTab.click();
    }
}
