const response = await fetch('https://centrala.ag3nts.org/report', {
    method: 'POST',
    body: JSON.stringify({
        "task": "mp3",
        "apikey": process.env.AZYL_API_KEY,
        "answer": "Stanisława Łojasiewicza",
    }),
});

console.log(await response.text());
