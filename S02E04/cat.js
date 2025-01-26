const fs = require('fs').promises;
const path = require('path');
const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const output = {
    people: [],
    hardware: [],
};

async function analizujPlik(sciezkaPliku) {
    try {
        const tresc = await fs.readFile(sciezkaPliku, 'utf-8');
        const odpowiedz = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: "Jesteś asystentem, który analizuje treść plików. Twoim zadaniem jest określić, czy plik zawiera informacje o schwytanych ludziach, śladach ich obecności lub naprawionych usterkach sprzętowych maszyn. Ignoruj informacje o usterkach oprogramowania.",
                },
                {
                    role: "user",
                    content: `Przeanalizuj poniższą treść i odpowiedz TYLKO 'ludzie', 'maszyny' lub 'brak', w zależności od zawartości:\n\n${tresc}`,
                },
            ],
            max_tokens: 10,
        });

        const wynik = odpowiedz.choices[0].message.content.toLowerCase().trim();

        if (wynik === 'ludzie') {
            output.people.push(path.basename(sciezkaPliku));
        } else if (wynik === 'maszyny') {
            output.hardware.push(path.basename(sciezkaPliku));
        }

        if (wynik === 'ludzie' || wynik === 'maszyny') {


            console.log(`Plik ${path.basename(sciezkaPliku)} zawiera informacje o: ${wynik}`);
        }
    } catch (error) {
        console.error(`Błąd podczas analizy pliku ${sciezkaPliku}:`, error);
    }

    await fs.writeFile('output.json', JSON.stringify(output, undefined, 2));
}

async function przeszukajKatalog(sciezkaKatalogu) {
    try {
        const pliki = await fs.readdir(sciezkaKatalogu);
        for (const plik of pliki) {
            const pelnaSciezka = path.join(sciezkaKatalogu, plik);
            const stat = await fs.stat(pelnaSciezka);
            if (stat.isFile() && path.extname(plik).toLowerCase() === '.txt') {
                await analizujPlik(pelnaSciezka);
            }
        }
    } catch (error) {
        console.error('Błąd podczas przeszukiwania katalogu:', error);
    }
}

// Użycie
const katalogZPlikami = './raporty';
await przeszukajKatalog(katalogZPlikami);
