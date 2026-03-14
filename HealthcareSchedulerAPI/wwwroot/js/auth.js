const API_BASE = "http://localhost:5059/api";

// REGISTER
async function registerUser(event) {
    event.preventDefault();

    const fullName = document.getElementById("fullName").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const response = await fetch(`${API_BASE}/Users/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            fullName: fullName,
            email: email,
            password: password,
            role: "Patient"
        })
    });

    if (response.ok) {
        alert("Account created successfully!");
        window.location.href = "login.html";
    } else {
        const text = await response.text();
        alert("Registration failed: " + text);
    }
}

// LOGIN
async function loginUser(event) {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const response = await fetch(`${API_BASE}/Users/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email: email,
            password: password
        })
    });

    if (response.ok) {
        const data = await response.json();

        localStorage.setItem("user", JSON.stringify(data));

        window.location.href = "/dashboard.html";

    } else {
        alert("Invalid login.");
    }
}
const checkbox = document.getElementById("showPassword");

if (checkbox) {
    checkbox.addEventListener("change", function () {
        const password = document.getElementById("password");
        password.type = this.checked ? "text" : "password";
    });
}
