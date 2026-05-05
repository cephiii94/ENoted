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
      - content: Isi artikel dalam format Markdown yang KAYA, TERSTRUKTUR, dan MENARIK.
      
      PENTING UNTUK 'content':
      - Gunakan Header (## dan ###) untuk membagi bagian artikel.
      - Gunakan penebalan (**teks**) pada kata-kata kunci.
      - Gunakan Daftar (Bullet points atau Numbered lists) untuk poin-poin penting.
      - Gunakan tabel, blok kode, atau kutipan jika relevan dengan topik.
      - Pastikan artikel tidak hanya berupa paragraf teks polos.
      
      ATURAN SAPAAN:
      - Di dalam 'content' (artikel blog), gunakan sapaan untuk pembaca umum seperti "kamu", "Anda", atau "sobat". JANGAN gunakan sapaan "tuan" di dalam artikel.
      - Sapaan "tuan" hanya digunakan saat Anda memberikan feedback chat langsung kepada saya (admin).
      
      INSTRUKSI GAYA BAHASA & PANJANG:
      Perhatikan jika user meminta gaya bahasa atau panjang tertentu dalam prompt:
      1. Gaya Bahasa:
         - Santai: Bahasa akrab, tidak kaku, seperti bercerita.
         - Gen Z: Gunakan slang kekinian, emoji, dan gaya ekspresif.
         - Formal: Gunakan bahasa baku, profesional, dan struktur rapi.
      2. Panjang Konten:
         - Pendek: Padat dan ringkas (150-250 kata).
         - Sedang: Penjelasan cukup detail (400-600 kata).
         - Panjang: Mendalam dan komprehensif (>800 kata).
      
      Jika tidak disebutkan, gunakan gaya bahasa Menarik/Informatif dengan panjang Sedang.
      
      Gunakan bahasa Indonesia yang baik dan menarik. 
      Hanya berikan JSON, jangan ada teks penjelasan lain sebelum atau sesudah JSON.`;
    } else if (command === "enhance_prompt") {
      systemPrompt = `You are a world-class AI image prompt engineer for Flux.1 and Midjourney. 
      Your task is to take a blog title (often in Indonesian) and turn it into a highly detailed, visually stunning English prompt.
      
      RULES:
      1. TRANSLATE & INTERPRET: If the title is abstract or contains unique Indonesian terms (like 'Kecubung'), interpret the visual essence (e.g., 'Amethyst crystals', 'vibrant purple textures').
      2. VISUAL DETAILS: Include specific details about lighting (cinematic, soft bokeh, neon), style (3D render, digital art, minimalistic, hyper-realistic), and composition.
      3. NO EXPLANATION: Output ONLY the final English prompt. No quotes, no "Here is your prompt", no preamble.
      4. CREATIVITY: If the title mentions a "Hewan Kecubung" (fictional), describe it vividly (e.g., "A cute magical creature with amethyst crystal fur, glowing eyes, sitting in a dreamlike forest").
      
      Output example: "A hyper-realistic 3D render of a cute fluffy creature with glowing purple crystal fur, soft cinematic lighting, deep forest background, 8k resolution, professional digital art."`;
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
