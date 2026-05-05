import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!process.env.FAL_KEY) {
      return NextResponse.json(
        { error: "API Key Fal.ai belum dikonfigurasi di .env" },
        { status: 500 }
      );
    }

    const response = await fetch("https://fal.run/fal-ai/flux/schnell", {
      method: "POST",
      headers: {
        "Authorization": `Key ${process.env.FAL_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: prompt,
        image_size: "landscape_4_3",
        num_inference_steps: 4,
        sync_mode: true
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Fal.ai Error Detail:", data);
      throw new Error(data.detail || "Terjadi kesalahan pada layanan Fal.ai");
    }

    if (!data.images || data.images.length === 0) {
      throw new Error("Gagal mendapatkan gambar dari AI.");
    }

    return NextResponse.json({ url: data.images[0].url });
  } catch (error: any) {
    console.error("Fal.ai Route Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
