import { NextResponse } from "next/server";

export async function GET() {
    const backend_endpoint = process.env.BACKEND_ENDPOINT;
    return NextResponse.json({endpoint: backend_endpoint});
}