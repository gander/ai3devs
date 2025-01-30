import fsSync from "node:fs";
import path from "node:path";
import OpenAI from "openai";
import unidecode from "unidecode";

export const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function sendReport(task, answer) {
    return new Promise((resolve) => {
        fetch("https://centrala.ag3nts.org/report", {
            method: "POST",
            body: JSON.stringify({
                task: task,
                apikey: process.env.AZYL_API_KEY,
                answer: answer,
            }),
        })
            .then((response) => response.text())
            .then((reply) => {
                console.log(reply);
                resolve(reply);
            });
    });
}

export async function sendQueryPathNamed(query, path) {
    return new Promise((resolve, reject) => {
        fetch(`https://centrala.ag3nts.org/${path}`, {
            method: "POST",
            body: JSON.stringify({
                apikey: process.env.AZYL_API_KEY,
                query: query,
            }),
        })
            .then((response) => response.json())
            .then(({ code, message }) => {
                if (code === 0) {
                    resolve(message);
                } else {
                    reject(`ERROR ${code}: ${message}`);
                }
            });
    });
}

export class MemoryQueue {
    constructor(initial = []) {
        this.queue = [];
        this.set = new Set();

        for (const v of initial) {
            this.enqueue(v);
        }
    }

    enqueue(element) {
        if (!this.set.has(element)) {
            this.queue.push(element);
            this.set.add(element);
        }
        return this;
    }

    dequeue() {
        if (this.isEmpty()) {
            return null;
        }
        const element = this.queue.shift();
        this.set.delete(element);
        return element;
    }

    isEmpty() {
        return this.queue.length === 0;
    }

    size() {
        return this.queue.length;
    }

    async process(callback) {
        while (!this.isEmpty()) {
            const element = this.dequeue();
            await callback(element);
        }
    }
}

export async function extractNamesAndCities(note) {
    const prompt = `
  Przeanalizuj poniższą notatkę i wykonaj następujące kroki:
  1. Wyodrębnij wszystkie imiona (tylko imiona) i nazwy miast.
  2. Sprowadź imiona i nazwy do mianownika.
  3. Usuń wszystkie znaki diakrytyczne, (czyli ó na o, ł na l, ą na a)
  4. Zapisz je wielkimi literami.
  5. Zwróć wynik jako tablicę stringów w formacie JSON.

  Notatka:
  ${note}

  <RESULT>
  {
    "people": ["JOZEF", "ANNA"],
    "places": ["WARSZAWA", "KRAKOW", "LODZ"]
  }
  <RESULT>
  `;

    const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 150,
    });

    const { people, places } = JSON.parse(response.choices[0].message.content);
    return { people, places };
}

export function transliterate(text) {
    return unidecode(text);
}

export async function wait(timeout) {
    return new Promise((resolve) => setTimeout(resolve, timeout));
}

export function writeFileSync(dir, file, content) {
    fsSync.writeFileSync(path.join(dir, file), content);
}

export function readFileSync(dir, file) {
    return fsSync.readFileSync(path.join(dir, file));
}
