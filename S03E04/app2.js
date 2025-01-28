import {sendQueryPathNamed, wait} from "../lib";
import {appendFile} from "fs/promises";

const miasta = [
    "KONIN",
    "FROMBORK",
    "GLITCH",
    "GRUDZIADZ",
    "CIECHOCINEK",
];

const queryPlaces = async (place) => {
    let response = '';
    try {
        response = await sendQueryPathNamed(place, 'places');
    } catch (e) {
        response = e;
    }
    await appendFile('./dane/dump2.log', `${place}: ${response}\n`);
    console.log(place, response);
};


for (const miasto of miasta) {
    await queryPlaces(miasto);
    await wait(1000);
}
