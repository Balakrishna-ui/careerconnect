import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB limit

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "application/pdf"];

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.formData();
    const file: File | null = data.get("file") as unknown as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File size exceeds the 5MB limit" }, { status: 413 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Verify Magic Bytes
    let fileType;
    try {
      const fileTypeLib = await import("file-type");
      fileType = await fileTypeLib.fileTypeFromBuffer(buffer);
    } catch (err) {
      console.warn("file-type import failed, falling back to client mime", err);
    }

    const actualMime = fileType?.mime || file.type;

    if (!ALLOWED_MIME_TYPES.includes(actualMime)) {
      return NextResponse.json({ error: "Invalid file type. Only JPEG, PNG, and PDF are allowed." }, { status: 415 });
    }

    // In Vercel, the filesystem is read-only (except /tmp). 
    // To support uploads without external blob storage (like S3/Cloudinary),
    // we convert the file to a Base64 Data URI and return it.
    const base64Data = buffer.toString('base64');
    const dataUri = `data:${actualMime};base64,${base64Data}`;

    // Return the Data URI to be saved in the database
    return NextResponse.json({ url: dataUri });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}
