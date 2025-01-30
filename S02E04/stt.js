import fs from "node:fs";
import { extname } from "node:path";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const files = fs
    .readdirSync("./raporty")
    .filter((file) => extname(file).toLowerCase() === ".mp3");

for await (const file of files) {
    const transcription = await openai.audio.transcriptions.create({
        file: fs.createReadStream(`./raporty/${file}`),
        model: "whisper-1",
        response_format: "text",
    });

    fs.writeFileSync(`./raporty/${file}.txt`, transcription);
    console.log(file);
}
