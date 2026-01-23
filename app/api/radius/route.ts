import { NextRequest, NextResponse } from "next/server";
import { searchZipCodesInRadius } from "@/lib/zipcodeapi";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { zip, radius, units = "mile" } = body;

    // Server-side validation
    if (!zip || typeof zip !== "string") {
      return NextResponse.json(
        { error: "Enter a valid 5-digit ZIP code." },
        { status: 400 }
      );
    }

    const cleanZip = zip.trim();
    if (!/^\d{5}$/.test(cleanZip)) {
      return NextResponse.json(
        { error: "Enter a valid 5-digit ZIP code." },
        { status: 400 }
      );
    }

    if (typeof radius !== "number" || radius <= 0) {
      return NextResponse.json(
        { error: "Enter a radius greater than 0." },
        { status: 400 }
      );
    }

    if (radius > 200) {
      return NextResponse.json(
        { error: "Radius too large for this tool (max: 200 miles)." },
        { status: 400 }
      );
    }

    const result = await searchZipCodesInRadius(cleanZip, radius, units);
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Couldn't fetch ZIP codes. Try again.";

    // Determine appropriate status code based on error
    let status = 500;
    if (message.includes("API key invalid") || message.includes("ZIPCODEAPI_KEY missing")) {
      status = 500;
    } else if (message.includes("rate limit")) {
      status = 429;
    } else if (message.includes("valid 5-digit")) {
      status = 400;
    }

    return NextResponse.json({ error: message }, { status });
  }
}
