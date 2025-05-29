import { NextResponse } from "next/server";

const baseUrl =
  process.env.BASE_URL ||
  "https://inventory-management-dvwp.onrender.com/api/v1";

export async function GET() {
  try {
    const response = await fetch(`${baseUrl}/issue-goods`);

    if (!response.ok) {
      throw new Error("Failed to fetch goods");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching goods:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("Received request body:", body);

    // Validate required fields
    const requiredFields = [
      "productId",
      "quantity",
      "categoryId",
      "sellingPrice",
      "grossPrice",
      "vendorId",
    ];
    const missingFields = requiredFields.filter((field) => !body[field]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(", ")}` },
        { status: 400 }
      );
    }

    // Validate numeric fields
    if (body.sellingPrice <= 0 || body.costPrice <= 0 || body.quantity < 0) {
      return NextResponse.json(
        { error: "Price and quantity must be positive numbers" },
        { status: 400 }
      );
    }

    const response = await fetch(`${baseUrl}/issue-goods`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error("Failed to create product");
    }

    const data = await response.json();
    console.log("API response data:", data);
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
