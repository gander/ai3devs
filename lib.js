import fsSync from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import OpenAI from "openai";
import unidecode from "unidecode";

export const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function sendReport(task, answer, isJson = false, debug = false) {
    return new Promise((resolve) => {
        fetch("https://centrala.ag3nts.org/report", {
            method: "POST",
            body: JSON.stringify({
                task: task,
                apikey: process.env.AZYL_API_KEY,
                answer: answer,
            }),
        })
            .then((response) => (isJson ? response.json() : response.text()))
            .then((reply) => {
                if (debug) {
                    console.log(reply);
                }
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

export function prepareChat(systemContent, ...userContents) {
    const messages = [
        {
            role: "system",
            content: systemContent,
        },
    ];

    for (const userContent of userContents) {
        if (userContent) {
            messages.push({
                role: "user",
                content: userContent,
            });
        }
    }

    return async (content) => {
        const body = {
            model: "gpt-4o",
            messages: [
                ...messages,
                {
                    role: "user",
                    content,
                },
            ],
        };

        // return JSON.stringify({body}, undefined, 2)

        const completion = await openai.chat.completions.create(body);
        return JSON.parse(completion.choices[0].message.content);
    };
}

export function dbS04E01(initial) {
    const REPAIR = "REPAIR";
    const DARKEN = "DARKEN";
    const BRIGHTEN = "BRIGHTEN";
    const DONE = "DONE";

    const storage = new Map();

    function add(image) {
        !has(image) &&
            storage.set(
                image,
                new Map([
                    [REPAIR, null],
                    [DARKEN, null],
                    [BRIGHTEN, null],
                    [DONE, false],
                ]),
            );
    }

    function has(image) {
        return storage.has(image);
    }

    function up(image, state, value) {
        storage.get(image).set(state, value);
    }

    function is(image, state) {
        return storage.get(image).get(state);
    }

    function dump() {
        return Object.fromEntries(
            storage
                .entries()
                .map(([key, value]) => [
                    key,
                    Object.fromEntries(value.entries()),
                ]),
        );
    }

    function extract(text) {
        for (const image of text.match(/IMG_.[^.]+\.PNG/g)) {
            add(image);
        }
    }

    async function eachState(callback, errorHandler) {
        for (const key of [REPAIR, DARKEN, BRIGHTEN]) {
            try {
                await callback(key);
            } catch (error) {
                if (errorHandler) {
                    errorHandler(error);
                } else {
                    throw error; // Propagacja błędu
                }
            }
        }
    }

    async function eachImage(callback, errorHandler) {
        for (const key of storage.keys()) {
            try {
                await callback(key);
            } catch (error) {
                if (errorHandler) {
                    errorHandler(error);
                } else {
                    throw error; // Propagacja błędu
                }
            }
        }
    }

    async function allDone() {
        return new Promise((resolve) => {
            for (const item of storage.values()) {
                if (!item.get(DONE)) {
                    resolve(false);
                }
            }

            resolve(true);
        });
    }

    function url(image) {
        return `https://centrala.ag3nts.org/dane/barbara/${image}`;
    }

    extract(initial);

    return {
        add,
        up,
        is,
        dump,
        extract,
        has,
        eachState,
        DONE,
        allDone,
        eachImage,
        url,
    };
}

export function getTextFromAudio(stream) {
    return openai.audio.transcriptions.create({
        file: stream,
        model: "whisper-1",
        response_format: "text",
    });
}

export async function readRemoteStreamToBuffer(url) {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
}

export async function readLocalStreamToBuffer(path) {
    return await fs.readFile(path);
}

export async function processImage(buforObrazu, prompt) {
    const obrazBase64 = buforObrazu.toString("base64");
    const zakodowanyObraz = `data:image/png;base64,${obrazBase64}`;

    const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
            {
                role: "user",
                content: [
                    {
                        type: "text",
                        text: prompt,
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

    return response.choices[0].message.content;
}
