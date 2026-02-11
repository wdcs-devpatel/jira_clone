const API_BASE = "https://dummyjson.com";

type UserId = string | number;

interface User {
  id: UserId;
  name?: string;
  avatar?: string;
  [key: string]: any;
}

export async function getUsers(): Promise<User[]> {
  try {
    const res = await fetch(`${API_BASE}/users?limit=10`);
    const data = await res.json();

    return (
      data.users?.map((u: any) => ({
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
  userId: UserId,
  profileData: Partial<User>
): Promise<User> {
  if (!userId) {
    throw new Error("User ID is missing. Please log out and back in.");
  }

  // Local users should NOT hit DummyJSON
  const isLocal =
    typeof userId === "string" && userId.startsWith("local-");

  if (isLocal) {
    return { ...profileData, id: userId };
  }

  const res = await fetch(`${API_BASE}/users/${userId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(profileData),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(
      errorData.message || "Update failed"
    );
  }

  return await res.json();
}
