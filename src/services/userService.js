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

export async function updateProfile(userId, profileData) {
  try {
    if (!userId) throw new Error("User ID is missing. Please log out and back in.");
    const res = await fetch(`${API_BASE}/users/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profileData),
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || 'Update failed');
    }
    return await res.json();
  } catch (error) {
    throw error;
  }
}