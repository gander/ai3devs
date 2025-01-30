import fs from "node:fs";

const response = await fetch("https://centrala.ag3nts.org/report", {
    method: "POST",
    body: JSON.stringify({
        task: "kategorie",
        apikey: process.env.AZYL_API_KEY,
        answer: JSON.parse(fs.readFileSync("output.json").toString()),
    }),
});

console.log(await response.text());
