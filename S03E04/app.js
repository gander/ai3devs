import {sendQueryPathNamed, MemoryQueue, extractNamesAndCities, transliterate} from "../lib";
import {readFileSync} from 'fs'
import {appendFile} from 'fs/promises'

const initial = await extractNamesAndCities(readFileSync('./dane/barbara.txt').toString());
const people = new MemoryQueue(initial.people);
const places = new MemoryQueue(initial.places);

const queryPeople = async (p) => {
    const response = await sendQueryPathNamed(p, 'people');
    await appendFile('./dane/dump.log', `${response}\n\n`);

    if (isRestrictedData(response)) {
        console.log(response);
        return;
    }

    transliterate(response).split(' ').forEach(v => {
        console.log(`Add place: ${v}`)
        places.enqueue(v)
    })

}
const queryPlaces = async (p) => {
    const response = await sendQueryPathNamed(p, 'places');
    await appendFile('./dane/dump.log', `${response}\n\n`);

    if (isRestrictedData(response)) {
        console.log(response);
        return;
    }

    transliterate(response).split(' ').forEach(v => {
        console.log(`Add person: ${v}`)
        people.enqueue(v)
    })
}

const isRestrictedData = (v) => v === '[**RESTRICTED DATA**]'

await people.process(async function(p){
    console.log(`Process: ${p}`);
    await queryPeople(p);
    await places.process(async function(p) {
        console.log(`Process: ${p}`);
        await queryPlaces(p);
    })
});



