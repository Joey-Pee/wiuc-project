import { NextResponse } from "next/server";

export async function GET() {
  try {
    const baseUrl =
      process.env.BASE_URL ||
      "https://inventory-management-dvwp.onrender.com/api/v1";
    const response = await fetch(`${baseUrl}/categories`);

    if (!response.ok) {
      throw new Error("Failed to fetch categories");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
