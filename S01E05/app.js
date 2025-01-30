const resCenzura = await fetch(
    "https://centrala.ag3nts.org/data/a9ef5e99-cd88-49e8-999b-364e2b9127d0/cenzura.txt",
);
const txtCenzura = await resCenzura.text();

console.log(resCenzura.headers);

async function ask(content) {
    return new Promise((resolve, reject) => {
        const options = {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.AZYL_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "sonar",
                messages: [
                    {
                        role: "system",
                        content:
                            "Zamień wszelkie wrażliwe dane (imię + nazwisko, miasto, ulica + numer domu, wiek, na słowo CENZURA. Zwróć uwagę na odmianę nazwy miasta przez przypadki, np 'Warszawie', a adres zaczyna się od ul., lub al. Zadbaj o każdą kropkę, przecinek, spację itp. Nie wolno Ci przeredagowywać tekstu. Sam tekst CENZURA bez stylowania. Przykładowe 'Nazywam się James Bond. Mieszkam w Warszawie na ulicy Pięknej 5. Mam 28 lat.' na 'Nazywam się CENZURA. Mieszkam w CENZURA na ulicy CENZURA. Mam CENZURA lat.'",
                    },
                    {
                        role: "user",
                        content: content,
                    },
                ],
                return_images: false,
                return_related_questions: false,
                stream: false,
            }),
        };

        fetch("https://api.perplexity.ai/chat/completions", options)
            .then((response) => response.json())
            .then((response) => resolve(response.choices[0].message.content))
            .catch((err) => reject(err));
    });
}

const answer = await ask(txtCenzura);

console.log({ answer });
const response = await fetch("https://centrala.ag3nts.org/report", {
    method: "POST",
    body: JSON.stringify({
        task: "CENZURA",
        apikey: process.env.AZYL_API_KEY,
        answer: answer,
    }),
});

console.log(await response.text());
