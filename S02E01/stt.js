import fs from "node:fs";
import { basename, extname } from "node:path";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const files = fs
    .readdirSync("./przesluchania")
    .filter((file) => extname(file).toLowerCase() === ".m4a");

for await (const file of files) {
    const transcription = await openai.audio.transcriptions.create({
        file: fs.createReadStream(`./przesluchania/${file}`),
        model: "whisper-1",
        response_format: "text",
    });

    fs.writeFileSync(
        `./przesluchania/${basename(file, "m4a")}txt`,
        transcription,
    );
    console.log(file);
}
