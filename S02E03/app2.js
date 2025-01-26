import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function generateImage(prompt) {
    return new Promise(async (resolve, reject) => {
        try {
            const response = await openai.images.generate({
                model: "dall-e-3",
                prompt: prompt,
                n: 1,
                size: "1024x1024",
                response_format: "url",
            });
            resolve(response.data[0].url);
        } catch (error) {
            reject(error);
        }
    });
}

const res = await fetch('https://centrala.ag3nts.org/data/a9ef5e99-cd88-49e8-999b-364e2b9127d0/robotid.json');
const {description} = await res.json();

console.log(description);

const url = await generateImage(description);

console.log(url);

const response = await fetch('https://centrala.ag3nts.org/report', {
    method: 'POST',
    body: JSON.stringify({
        "task": "robotid",
        "apikey": process.env.AZYL_API_KEY,
        "answer": url,
    }),
});

console.log(await response.text());

// Example usage
//
