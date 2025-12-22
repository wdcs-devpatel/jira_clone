const API_BASE = "https://dummyjson.com";

export async function getUsers() {
  try {
    const res = await fetch(`${API_BASE}/users?limit=10`);
    const data = await res.json();
    return data.users.map(u => ({
      id: u.id,
      name: `${u.firstName} ${u.lastName}`,
      avatar: u.image
    })) || [];
  } catch {
    return [];
  }
}