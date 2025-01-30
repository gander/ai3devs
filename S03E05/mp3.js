import { file } from "bun";
import { openai } from "../lib";

async function transcribeAndTranslate(audioFilePath) {
    try {
        // Wczytanie pliku audio
        const audioFile = file(audioFilePath);

        // Transkrypcja audio
        console.log("Rozpoczynam transkrypcję...");
        const transcription = await openai.audio.transcriptions.create({
            file: audioFile,
            model: "whisper-1",
        });

        console.log("Transkrypcja zakończona. Tłumaczę na polski...");

        // Tłumaczenie transkrypcji na język polski
        const translation = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                {
                    role: "system",
                    content:
                        "Jesteś profesjonalnym tłumaczem. Przetłumacz podany tekst na język polski.",
                },
                { role: "user", content: transcription.text },
            ],
        });

        // Zwracamy oryginalną transkrypcję i tłumaczenie
        return {
            oryginalnaTranskrypcja: transcription.text,
            polskieTlumaczenie: translation.choices[0].message.content,
        };
    } catch (error) {
        console.error("Wystąpił błąd:", error);
        throw error;
    }
}
console.log(await transcribeAndTranslate("./rev.mp3"));
