import { readFileSync } from "node:fs";
import { appendFile } from "node:fs/promises";
import {
    MemoryQueue,
    extractNamesAndCities,
    sendQueryPathNamed,
    transliterate,
} from "../lib";

const initial = await extractNamesAndCities(
    readFileSync("./dane/barbara.txt").toString(),
);
const people = new MemoryQueue(initial.people);
const places = new MemoryQueue(initial.places);

const queryPeople = async (p) => {
    const response = await sendQueryPathNamed(p, "people");
    await appendFile("./dane/dump.log", `${response}\n\n`);

    if (isRestrictedData(response)) {
        console.log(response);
        return;
    }

    const chunks = transliterate(response).split(" ");

    for (const chunk of chunks) {
        console.log(`Add place: ${chunk}`);
        places.enqueue(chunk);
    }
};
const queryPlaces = async (p) => {
    const response = await sendQueryPathNamed(p, "places");
    await appendFile("./dane/dump.log", `${response}\n\n`);

    if (isRestrictedData(response)) {
        console.log(response);
        return;
    }

    const chunks = transliterate(response).split(" ");
    for (const chunk of chunks) {
        console.log(`Add person: ${chunk}`);
        people.enqueue(chunk);
    }
};

const isRestrictedData = (v) => v === "[**RESTRICTED DATA**]";

await people.process(async (p) => {
    console.log(`Process: ${p}`);
    await queryPeople(p);
    await places.process(async (p) => {
        console.log(`Process: ${p}`);
        await queryPlaces(p);
    });
});
