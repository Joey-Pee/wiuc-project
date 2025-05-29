import { NextResponse } from "next/server";

const baseUrl =
  process.env.BASE_URL ||
  "https://inventory-management-dvwp.onrender.com/api/v1";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const response = await fetch(`${baseUrl}/users/authenticate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || "Authentication failed" },
        { status: response.status }
      );
    }

    // Set the authentication token in cookies
    const token = data.token;
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict" as const,
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    };

    const responseWithCookie = NextResponse.json(
      { message: "Authentication successful", user: data.user },
      { status: 200 }
    );

    responseWithCookie.cookies.set("auth_token", token, cookieOptions);

    return responseWithCookie;
  } catch (error) {
    console.error("Authentication error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
