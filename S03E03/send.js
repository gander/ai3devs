const response = await fetch("https://centrala.ag3nts.org/report", {
    method: "POST",
    body: JSON.stringify({
        task: "database",
        apikey: process.env.AZYL_API_KEY,
        answer: [
            {
                dc_id: "4278",
                location: "Gdańsk",
            },
            {
                dc_id: "9294",
                location: "Grudziądz",
            },
        ],
    }),
});

console.log(await response.text());
