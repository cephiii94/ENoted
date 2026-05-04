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
      systemPrompt += `Tugas Anda adalah menghasilkan konten blog dalam format JSON murni. 
      JSON harus memiliki field: 
      - title: Judul artikel yang menarik.
      - category: Salah satu dari ('belajar-koding', 'tutorial', 'islam', 'umum').
      - summary: Ringkasan singkat SEO (maks 150 karakter).
      - content: Isi artikel dalam format Markdown yang lengkap dan informatif.
      
      Gunakan bahasa Indonesia yang baik dan menarik. 
      Hanya berikan JSON, jangan ada teks penjelasan lain.`;
    }

    const response = await fetch("https://api.together.xyz/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.TOGETHER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "meta-llama/Llama-3-70b-chat-hf",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2048,
      }),
    });

    const data = await response.json();
    const content = data.choices[0].message.content;

    return NextResponse.json({ result: content });
  } catch (error: any) {
    console.error("AI Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
