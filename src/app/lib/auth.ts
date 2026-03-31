import type { AppUser } from "./api";

const KEY = "currentUser";

export function setCurrentUser(user: AppUser) {
localStorage.setItem(KEY, JSON.stringify(user));
}

export function getCurrentUser(): AppUser | null {
const raw = localStorage.getItem(KEY);
if (!raw) return null;
try { return JSON.parse(raw) as AppUser; } catch { return null; }
}

export function clearCurrentUser() {
localStorage.removeItem(KEY);
}