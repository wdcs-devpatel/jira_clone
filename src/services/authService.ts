// src/services/authService.ts

import { LoginResponse } from "../interfaces";

export async function loginUser(
  username: string,
  password: string
): Promise<LoginResponse> {
  const response = await fetch("https://dummyjson.com/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username,
      password,
      expiresInMins: 60,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Invalid credentials");
  }

  return await response.json();
}
