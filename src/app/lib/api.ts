export interface AppUser {
id: number;
fullName: string;
email: string;
role: string;
}

export interface Provider {
id: number;
fullName: string;
specialty: string;
workingHours: string;
}

export interface Appointment {
id: number;
patientId: number;
providerId: number;
appointmentDateTime: string;
reason: string;
status: string;
}

const API_BASE = "http://localhost:5059";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
const res = await fetch(API_BASE + path, {
headers: { "Content-Type": "application/json", ...(options?.headers || {}) },
...options,
});

if (!res.ok) {
const msg = await res.text();
throw new Error(msg || "Request failed");
}

return res.json() as Promise<T>;
}

export const api = {
login: (email: string, password: string) =>
request<AppUser>("/api/users/login", {
method: "POST",
body: JSON.stringify({ email, password }),
}),
register: (fullName: string, email: string, password: string) =>
request<AppUser>("/api/users/register", {
method: "POST",
body: JSON.stringify({ fullName, email, password, role: "Patient" }),
}),
getProviders: () => request<Provider[]>("/api/providers"),

createProvider: (fullName: string, specialty: string, workingHours: string) =>
request<Provider>("/api/providers", {
method: "POST",
body: JSON.stringify({ fullName, specialty, workingHours }),
}),
getPatientAppointments: (patientId: number) =>
request<Appointment[]>("/api/appointments/patient/" + patientId),
bookAppointment: (payload: {
patientId: number;
providerId: number;
appointmentDateTime: string;
reason: string;
}) =>
request<Appointment>("/api/appointments", {
method: "POST",
body: JSON.stringify({ ...payload, status: "Booked" }),
}),
cancelAppointment: (id: number) =>
request<Appointment>("/api/appointments/cancel/" + id, { method: "POST" }),
};