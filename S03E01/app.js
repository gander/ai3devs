import OpenAI from 'openai';
import fs from 'fs/promises';
import path from 'path';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function processReports(reportsDir, factsDir) {
    try {
        const promptContent = generatePrompt();
        const facts = await readFiles(factsDir);
        const reports = await readFiles(reportsDir);

        const messages = [
            { role: 'system', content: 'Jesteś ekspertem w analizie tekstu i generowaniu słów kluczowych.' },
            { role: 'user', content: promptContent },
            { role: 'user', content: `Fakty:\n${facts.join('\n')}` },
            { role: 'user', content: `Raporty:\n${reports.join('\n')}` },
        ];

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: messages,
        });

        const result = parseResponse(completion.choices[0].message.content);
        console.log(JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('Wystąpił błąd:', error);
    }
}

async function readFiles(directory) {
    const files = await fs.readdir(directory);
    const fileContents = await Promise.all(
        files.map(async (file) => {
            const content = await fs.readFile(path.join(directory, file), 'utf-8');
            return `${file}:\n${content}`;
        })
    );
    return fileContents;
}

function generatePrompt() {
    return `
Analizuj raporty i generuj słowa kluczowe w mianowniku dla każdego raportu. Użyj poniższego procesu:

1. Znajdź numer sektora w nazwie pliku (WAŻNE).
2. Przeczytaj treść raportu.
3. Przeanalizuj powiązane fakty.
4. Zidentyfikuj główne tematy i koncepcje. 
5. Powiąż osoby i miejsca z raportów z informacjami z faktów. Dodaj do słów kluczowych zawody osób znalezione w faktach
6. Wyodrębnij najważniejsze słowa i frazy.
7. Przekształć je w słowa kluczowe w mianowniku.
8. Usuń duplikaty i mało istotne słowa.
9. Utwórz finalną listę 10-20 słów kluczowych, zawierającą numer sektora i imię+nazwisko (jeśli występuje).

Przykład:

Raport (2024-11-12_report-00-sektor_C4.txt):
"Godzina 22:43. Wykryto jednostkę organiczną w pobliżu północnego skrzydła fabryki. Osobnik przedstawił się jako Aleksander Ragowski. Przeprowadzono skan biometryczny, zgodność z bazą danych potwierdzona. Jednostka przekazana do działu kontroli. Patrol kontynuowany."

Wyświetl proces myślowy:
1. Raport dotyczy wykrycia człowieka, nazywającego się Aleksander Ragowski w sektorze C4. Z faktów wiemy że to nauczyciel  
2. Główne tematy: wzrost efektywności, automatyzacja procesów, reakcja pracowników.
3. Kluczowe frazy: "wzrost efektywności", "sektor C4", "automatyzacja procesów", "system produkcyjny", "Jan Kowalski".
4. Przekształcenie w mianownik i dodanie wymaganych elementów.

Słowa kluczowe: efektywność, sektor C4, automatyzacja, proces produkcyjny, technologia, pracownik, Jan Kowalski

Na koniec wygeneruj podobne listy słów kluczowych dla pozostałych raportów. Wynik przedstaw w formacie JSON:

{
"2024-11-12_report-00-sektor_C4.txt":"efektywność, sektor, C4, automatyzacja, proces produkcyjny, technologia, pracownik, Jan Kowalski",
...
}
`;
}

function parseResponse(response) {
    const jsonStart = response.indexOf('{');
    const jsonEnd = response.lastIndexOf('}');
    if (jsonStart === -1 || jsonEnd === -1) {
        throw new Error('Nie znaleziono poprawnego formatu JSON w odpowiedzi.');
    }
    const jsonString = response.slice(jsonStart, jsonEnd + 1);
    return JSON.parse(jsonString);
}

// Użycie funkcji
const reportsDir = './dane/reports';
const factsDir = './dane/facts';

await processReports(reportsDir, factsDir);
