const API_BASE = "https://dummyjson.com";

export async function getUsers() {
  const res = await fetch(`${API_BASE}/users`);
  const data = await res.json();
  return data.users || [];
}
