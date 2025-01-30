import fs from "node:fs";

const response = await fetch("https://centrala.ag3nts.org/report", {
    method: "POST",
    body: JSON.stringify({
        task: "arxiv",
        apikey: process.env.AZYL_API_KEY,
        answer: {
            "01": "Truskawka",
            "02": "Kraków",
            "03": "Hotel",
            "04": "Pizza",
            "05": "Brave New World",
        },
    }),
});

console.log(await response.text());
