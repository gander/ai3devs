import fs from 'node:fs';

const response = await fetch('https://centrala.ag3nts.org/report', {
    method: 'POST',
    body: JSON.stringify({
        "task": "wektory",
        "apikey": process.env.AZYL_API_KEY,
        "answer": "2024-02-21"
    }),
});

console.log(await response.text());
