import fs from "node:fs/promises";

async function fetchData(query) {
    return new Promise((resolve, reject) => {
        fetch("https://centrala.ag3nts.org/apidb", {
            method: "POST",
            body: JSON.stringify({
                task: "database",
                apikey: process.env.AZYL_API_KEY,
                query: query,
            }),
        })
            .then((response) => response.json())
            .then(({ reply, error }) => {
                if (error === "OK") {
                    resolve(reply);
                } else {
                    reject(error);
                }
            });
    });
}

await fs.writeFile(
    "flag.txt",
    JSON.stringify(
        await fetchData(
            'SELECT GROUP_CONCAT(letter ORDER BY weight SEPARATOR "") as result FROM correct_order',
        ),
    ),
);
