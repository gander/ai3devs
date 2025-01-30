const generujObraz = (opis) =>
    new Promise((resolve, reject) =>
        fetch("https://api.openai.com/v1/images/generations", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "dall-e-3",
                prompt: opis,
                n: 1,
                size: "1024x1024",
                quality: "standard",
                style: "vivid",
            }),
        })
            .then((response) => response.json())
            .then((response) => resolve(response.data[0].url))
            .catch(reject),
    );

generujObraz("Pięciogłowa hydra z 'Age of Wonders 4'")
    .then((url) => console.log(`Obraz został wygenerowany: ${url}`))
    .catch((err) => console.error("Błąd:", err));
