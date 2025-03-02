const express = require("express");
const { openai } = require("../lib");

const app = express();
app.use(express.json());

const GRID_MAP_PROMPT = `
Mapa jest kwadratem 4x4. Współrzędne zaczynają się od (0,0) w lewym górnym rogu. 
Opis pól:
[ (0,0): start ]
[ (1,0): trawa ] [ (2,0): drzewo ] [ (3,0): dom ]
[ (0,1): trawa ] [ (1,1): młyn ] [ (2,1): trawa ] [ (3,1): trawa ]
[ (0,2): trawa ] [ (1,2): trawa ] [ (2,2): skały ] [ (3,2): drzewa ]
[ (0,3): góry ] [ (1,3): góry ] [ (2,3): samochód ] [ (3,3): jaskinia ]

Zasady:
1. Każda instrukcja zaczyna się od pozycji startowej (0,0)
2. "prawo/lewo" zmienia współrzędną X (+/-)
3. "góra/dół" zmienia współrzędną Y (+/-)
4. "sam dół" = Y=3, "samą górę" = Y=0
5. Nie wychodzić poza zakres 0-3
6. Odpowiedź w formacie <format>(2,2): piasek</format>
`;

app.post("/api/drone", async (req, res) => {
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                {
                    role: "system",
                    content: GRID_MAP_PROMPT,
                },
                {
                    role: "user",
                    content: `Instrukcja: ${req.body.instruction}\nOpis:`,
                },
            ],
            temperature: 0.1,
        });

        const response = completion.choices[0].message.content;
        const [coords, description] = response.split(":").map((s) => s.trim());

        console.log({
            coords,
            description,
            debug: { received: req.body, response: response },
        });

        res.json({ description });
    } catch (error) {
        res.status(500).json({ error });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
