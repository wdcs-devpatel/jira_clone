const API_BASE = "https://dummyjson.com";

interface User {
  id: number | string;
  name: string;
  avatar: string;
}

export async function getUsers(): Promise<User[]> {
  try {
    const res = await fetch(`${API_BASE}/users?limit=10`);
    const data = await res.json();

    return (
      data.users.map((u: any) => ({
        id: u.id,
        name: `${u.firstName} ${u.lastName}`,
        avatar: u.image,
      })) || []
    );
  } catch {
    return [];
  }
}

export async function updateProfile(
  userId: number | string, // ✅ Changed to allow string IDs
  profileData: Record<string, any>
) {
  if (!userId) {
    throw new Error("User ID is missing. Please log out and back in.");
  }

  // ✅ Check if it's a local user
  // We don't send local users to the DummyJSON server because they don't exist there.
  const isLocal = typeof userId === "string" && userId.startsWith("local-");
  
  if (isLocal) {
    // Return the data as if the server accepted it so Profile.tsx can handle localStorage
    return { ...profileData, id: userId };
  }

  const res = await fetch(`${API_BASE}/users/${userId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(profileData),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Update failed");
  }

  return await res.json();
}