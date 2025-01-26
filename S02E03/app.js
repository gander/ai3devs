const axios = require('axios');

const generujObraz = async (opis) => {
    const apiKey = process.env.OPENAI_API_KEY;
    const url = 'https://api.openai.com/v1/images/generations';

    try {
        const odpowiedz = await axios.post(url, {
            model: "dall-e-3",
            prompt: opis,
            n: 1,
            size: "1024x1024",
            quality: "standard",
            style: "vivid",
        }, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
        });

        const urlObrazu = odpowiedz.data.data[0].url;
        console.log(`Wygenerowany obraz: ${urlObrazu}`);
        return urlObrazu;
    } catch (blad) {
        console.error('Wystąpił błąd podczas generowania obrazu:', blad);
        throw blad;
    }
};

// Przykładowe użycie
generujObraz("Kolorowy parasol na plaży, aparat jednorazowy")
    .then(url => console.log(`Obraz został wygenerowany: ${url}`))
    .catch(blad => console.error('Błąd:', blad));
