const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export async function api(
    path: string,
    options: RequestInit = {}
) {
    const token =
        typeof window !== "undefined"
            ? localStorage.getItem("token")
            : null;

    const response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(token
                ? { Authorization: `Bearer ${token}` }
                : {}),
            ...(options.headers || {})
        }
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
    }

    return data;
}