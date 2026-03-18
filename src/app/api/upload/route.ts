import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

const FORMATS = [
  { name: "square", width: 1080, height: 1080 },
  { name: "story", width: 1080, height: 1920 },
  { name: "landscape", width: 1200, height: 630 },
];

async function processImage(
  buffer: Buffer,
  width: number,
  height: number
): Promise<string> {
  const processed = await sharp(buffer)
    .resize(width, height, {
      fit: "cover",
      position: "center",
    })
    .png()
    .toBuffer();

  return processed.toString("base64");
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get("image") as File | null;

    if (!image) {
      return NextResponse.json(
        { error: "No se ha proporcionado ninguna imagen" },
        { status: 400 }
      );
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(image.type)) {
      return NextResponse.json(
        { error: "Tipo de archivo no permitido. Usa JPG, PNG, WEBP o GIF" },
        { status: 400 }
      );
    }

    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const originalBase64 = buffer.toString("base64");

    const formats = await Promise.all(
      FORMATS.map(async (format) => {
        const base64 = await processImage(buffer, format.width, format.height);
        return {
          [format.name]: {
            base64,
            width: format.width,
            height: format.height,
          },
        };
      })
    );

    const formatsObject = formats.reduce((acc, curr) => ({ ...acc, ...curr }), {});

    return NextResponse.json({
      formats: formatsObject,
      original: {
        base64: originalBase64,
        size: buffer.length,
      },
    });
  } catch (error) {
    console.error("Error processing image:", error);
    return NextResponse.json(
      { error: "Error al procesar la imagen" },
      { status: 500 }
    );
  }
}
