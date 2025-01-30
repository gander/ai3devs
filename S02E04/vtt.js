import fs from "node:fs/promises";
import { extname } from "node:path";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function ekstrahujTekstZObrazu(sciezkaDoPliku) {
    try {
        // Wczytaj obraz i zakoduj go w base64
        const buforObrazu = await fs.readFile(sciezkaDoPliku);
        const obrazBase64 = buforObrazu.toString("base64");
        const zakodowanyObraz = `data:image/png;base64,${obrazBase64}`;

        // Wywołaj API OpenAI
        const odpowiedz = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: "Odczytaj i zwróć cały tekst widoczny na tym obrazie. Tylko tekst widoczny na obrazie, bez dodatkowych informacji.",
                        },
                        {
                            type: "image_url",
                            image_url: { url: zakodowanyObraz },
                        },
                    ],
                },
            ],
            max_tokens: 300,
        });

        // Zwróć odczytany tekst
        return odpowiedz.choices[0].message.content;
    } catch (blad) {
        console.error("Wystąpił błąd:", blad);
        return null;
    }
}

const files = await fs.readdir("./raporty");

const images = files.filter((file) => extname(file).toLowerCase() === ".png");

for await (const file of images) {
    const transcription = await ekstrahujTekstZObrazu(`./raporty/${file}`);

    await fs.writeFile(`./raporty/${file}.txt`, transcription);
    console.log(file);
}
