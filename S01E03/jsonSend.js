import fs from "node:fs";

const response = await fetch("https://centrala.ag3nts.org/report", {
    method: "POST",
    body: JSON.stringify({
        task: "JSON",
        apikey: process.env.AZYL_API_KEY,
        answer: JSON.parse(fs.readFileSync("json2.txt").toString()),
    }),
});

console.log(await response.text());
