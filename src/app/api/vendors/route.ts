import { NextResponse } from "next/server";

const baseUrl =
  process.env.BASE_URL ||
  "https://inventory-management-dvwp.onrender.com/api/v1";

export async function GET() {
  try {
    const response = await fetch(`${baseUrl}/vendors`);

    if (!response.ok) {
      throw new Error("Failed to fetch vendors");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching vendors:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // console.log("Received request body:", body);

    // Validate required fields
    const requiredFields = [
      "name",
      "email",
      "phone",
      "address",
      "city",
      "state",
      "zipCode",
      "contactPerson",
    ];
    const missingFields = requiredFields.filter((field) => !body[field]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(", ")}` },
        { status: 400 }
      );
    }

    const response = await fetch(`${baseUrl}/vendors`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error("Failed to create vendor");
    }

    const data = await response.json();
    // console.log("API response data:", data);
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error creating vendor:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

// export async function PUT(request: Request) {
//   try {
//     const body = await request.json();

//     const response = await fetch(`${baseUrl}/vendors`, {
//       method: "PUT",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(body),
//     });

//     if (!response.ok) {
//       throw new Error("Failed to update vendor");
//     }

//     const data = await response.json();
//     return NextResponse.json(data);
//   } catch (error) {
//     console.error("Error updating vendor:", error);
//     return NextResponse.json(
//       { error: (error as Error).message },
//       { status: 500 }
//     );
//   }
// }
