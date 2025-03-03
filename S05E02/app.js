import fs from "node:fs/promises";
import { openai, sendReport } from "../lib";

const API_ENDPOINTS = {
    database: "https://centrala.ag3nts.org/apidb",
    gps: "https://centrala.ag3nts.org/gps",
};

async function fetchDatabase(query) {
    const response = await fetch(API_ENDPOINTS.database, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            task: "database",
            apikey: process.env.AZYL_API_KEY,
            query: query,
        }),
    });

    const { reply, error } = await response.json();
    if (error !== "OK") throw new Error(`Database error: ${reply}`);
    return reply;
}

async function getGPSCoordinates(userID) {
    const response = await fetch(API_ENDPOINTS.gps, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userID }),
    });

    if (!response.ok) throw new Error(`GPS API error: ${response.status}`);
    return response.json();
}

async function main() {
    try {
        // 1. Pobranie i walidacja pytania
        const questionData = JSON.parse(
            await fs.readFile(`${__dirname}/gps_question.json`),
        );
        const targetLocation = questionData.question.match(/do (\w+)/i)?.[1];

        if (!targetLocation) throw new Error("Nieprawidłowy format pytania");

        // 2. Pobranie dostępnych centrów
        const datacenters = await fetchDatabase(
            `SELECT dc_id, location FROM datacenters WHERE location LIKE '%${targetLocation}%'`,
        );

        if (!datacenters.length) {
            const availableLocations = await fetchDatabase(
                "SELECT location FROM datacenters LIMIT 5",
            );
            throw new Error(
                `Brak centrum w '${targetLocation}'. Dostępne lokalizacje: ${availableLocations.map((d) => d.location).join(", ")}`,
            );
        }

        // 3. Pobranie użytkowników
        const users = await fetchDatabase(
            `SELECT u.username, u.id
             FROM users u
             WHERE u.datacenter_id = ${datacenters[0].dc_id}
               AND u.username != 'Barbara'`,
        );

        // 4. Pobieranie współrzędnych
        const results = {};
        for (const user of users) {
            try {
                const coords = await getGPSCoordinates(user.id);
                results[user.username] = {
                    lat: Number(coords.lat).toFixed(6),
                    lon: Number(coords.lon).toFixed(6),
                };
            } catch (error) {
                console.error(`Błąd dla ${user.username}: ${error.message}`);
            }
        }

        console.log("Finalne współrzędne:", results);
        await fs.writeFile(
            `${__dirname}/gps_result.json`,
            JSON.stringify(results, null, 2),
        );

        return sendReport("gps", results, true, true);
    } catch (error) {
        console.error("Błąd wykonania:", error.message);
        process.exit(1);
    }
}

// await main();

function trimPos(coords) {
    return coords;
    // return {
    //     lat: Number(Number(coords.lat).toFixed(3)),
    //     lon: Number(Number(coords.lon).toFixed(3))
    // }
}

await sendReport(
    "gps",
    {
        rafal: trimPos((await getGPSCoordinates(28)).message),
        azazel: trimPos((await getGPSCoordinates(3)).message),
        samuel: trimPos((await getGPSCoordinates(98)).message),
    },
    true,
    true,
);
