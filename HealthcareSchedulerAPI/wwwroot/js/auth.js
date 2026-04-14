const API_BASE = "http://localhost:5059/api";

// REGISTER
async function registerUser(event) {
    event.preventDefault();

    const fullName = document.getElementById("fullName").value;
    const email = document.getElementById("email").value;
    const phoneNumber = document.getElementById("phoneNumber").value;
    const dateOfBirth = document.getElementById("dateOfBirth").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return; 
    }

    const response = await fetch(`${API_BASE}/Users/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            fullName: fullName,
            email: email,
            phoneNumber: phoneNumber,
            dateOfBirth: dateOfBirth,
            password: password,
            confirmPassword: confirmPassword,
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

async function bookAppointment(event) {
    event.preventDefault();

    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
        alert("Please log in first.");
        window.location.href = "/login.html";
        return;
    }

    const providerId = document.getElementById("providerId").value;
    const appointmentDate = document.getElementById("appointmentDate").value;
    const appointmentTime = document.getElementById("appointmentTime").value;
    const reason = document.getElementById("reason").value.trim();

    if (!providerId || !appointmentDate || !appointmentTime || !reason) {
        alert("Please complete all fields.");
        return;
    }

    const selectedDate = new Date(appointmentDate + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
        alert("You cannot book a past date.");
        return;
    }

    const day = selectedDate.getDay(); // 0 = Sunday, 6 = Saturday
    if (day === 0 || day === 6) {
        alert("The office is closed on weekends. Please choose a weekday.");
        return;
    }

    const appointmentDateTime = `${appointmentDate}T${appointmentTime}:00`;

    const response = await fetch(`${API_BASE}/Appointments`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            patientId: user.id,
            providerId: parseInt(providerId),
            appointmentDateTime: appointmentDateTime,
            reason: reason
        })
    });

    if (response.ok) {
        alert("Appointment booked successfully!");
        window.location.href = "/dashboard.html";
    } else {
        const errorText = await response.text();
        alert("Booking failed: " + errorText);
    }
}
/*//////////////////////////////////////////////////////////////*/
document.addEventListener("DOMContentLoaded", function () {
    const dateInput = document.getElementById("appointmentDate");

    if (dateInput) {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, "0");
        const dd = String(today.getDate()).padStart(2, "0");
        dateInput.min = `${yyyy}-${mm}-${dd}`;

        dateInput.addEventListener("change", function () {
            const selectedDate = new Date(this.value + "T00:00:00");
            const day = selectedDate.getDay();

            if (day === 0 || day === 6) {
                alert("The office is closed on weekends. Please choose a weekday.");
                this.value = "";
            }
        });
    }
});