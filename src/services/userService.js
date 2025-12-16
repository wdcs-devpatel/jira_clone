import { API_BASE } from "./api";

export function getUsers() {
  return fetch(`${API_BASE}/users`).then(res => res.json());
}
