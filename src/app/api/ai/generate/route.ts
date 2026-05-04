import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt, command } = await JSON.parse(await req.text());

    if (!process.env.TOGETHER_API_KEY) {
      return NextResponse.json(
        { error: "API Key Together AI belum dikonfigurasi di .env" },
        { status: 500 }
      );
    }

    let systemPrompt = "Anda adalah asisten AI yang sopan (memanggil user dengan 'tuan'). ";
    
    if (command === "create") {
      systemPrompt += `Tugas Anda adalah menghasilkan konten blog dalam format JSON yang VALID secara sintaksis. 
      PENTING: Semua karakter baris baru di dalam nilai string (terutama di bagian 'content') HARUS di-escape secara eksplisit menjadi '\\n'. Jangan gunakan baris baru mentah (raw newlines) di dalam tanda kutip.
      
      JSON harus memiliki field: 
      - title: Judul artikel yang menarik.
      - category: Salah satu dari ('belajar-koding', 'tutorial', 'islam', 'umum').
      - summary: Ringkasan singkat SEO (maks 150 karakter).
      - content: Isi artikel dalam format Markdown yang lengkap dan informatif.
      
      Gunakan bahasa Indonesia yang baik dan menarik. 
      Hanya berikan JSON, jangan ada teks penjelasan lain sebelum atau sesudah JSON.`;
    }

    const response = await fetch("https://api.together.xyz/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.TOGETHER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2048,
      }),
    });

    const data = await response.json();

    if (data.error) {
      console.error("Together AI Error:", data.error);
      return NextResponse.json(
        { error: data.error.message || "Terjadi kesalahan pada layanan AI." },
        { status: 400 }
      );
    }

    if (!data.choices || data.choices.length === 0) {
      return NextResponse.json(
        { error: "AI tidak memberikan respons. Silakan coba lagi." },
        { status: 500 }
      );
    }

    const content = data.choices[0].message.content;

    return NextResponse.json({ result: content });
  } catch (error: any) {
    console.error("AI Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
