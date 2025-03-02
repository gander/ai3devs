import fs from "node:fs/promises";
import {
    dbS04E01,
    prepareChat,
    processImage,
    readRemoteStreamToBuffer,
    sendReport,
} from "../lib";

const { message: init } = await sendReport("photos", "START", true);

const chatter = prepareChat(
    "Umiesz oceniać po tonie wypowiedzi, czy pochwala czy karci. Odpowiadasz na to odpowiednio 1 lub 0. Tylko cyfra.",
    "<example>No ja nie wiem... tak patrz\u0119 na to foto i mi si\u0119 nie wydaje, aby ta operacja mia\u0142a sens. Mo\u017ce spr\u00f3bujesz czego\u015b innego?</example><result>0</result>",
    "<example>NO! Teraz widać twarze i włosy. To był dobry pomysł!</example><result>1</result>",
    "<example>Ejjj... no weź... to wygląda jeszcze gorzej niż przed operacją. Weź spróbuj czegoś innego.</example><result>0</result>",
    "<example>Co tu się... no nie... to nie wygląda dobrze. Spróbuj czegoś innego.</example><result>0</result>",
    "<example>Jest źle. Bardzo źle. Ta operacja nic nam nie dała. Nie wydobyłą nowych szczegółów, a może nawet popsuła zdjęcie</example><result>0</result>",
    "<example>Pyk, pyk, pyk, pytk jako tako i fajrant! Dałem z siebie całe 30%</example><result>1</result>",
    "<example>Się robi! Czekaj... czekaj... o!</example><result>1</result>",
    "<example></example><result></result>",
);

const oI = dbS04E01(init);

while (!(await oI.allDone())) {
    await oI.eachImage(async (image) => {
        if (oI.is(image, oI.DONE)) {
            return;
        }

        await oI.eachState(async (state) => {
            await sendReport("photos", `${state} ${image}`, true)
                .then(async ({ message }) => {
                    oI.extract(message);
                    await fs.appendFile("messages.log", `${message}\n`);
                    return chatter(message);
                })
                .then(async (result) => {
                    await fs.appendFile(
                        "mutations.log",
                        `${image} ${state} ${result}\n`,
                    );
                    oI.up(image, state, Boolean(result));
                });
        });

        oI.up(image, oI.DONE, true);
    });
}

console.log(oI.dump());

await oI.eachImage(async (image) => {
    const buffer = await readRemoteStreamToBuffer(oI.url(image));

    console.log(oI.url(image));
    const text = await processImage(
        buffer,
        "Na zdjęciu powinni być widoczni ludzie. Jeśli obraz jest zniekształcony, nic nie odpowiadaj. Nie identyfikuj osób, tylko je opisz. Opisz w języku polskim cechy charakterystyczne, np takie jak kolor włosów, ich kształt, fakturę skóry, starość, itd. Ciągiem, bez znaków nowej linii. NIE PRÓBUJ ROZPOZNAWAĆ OSÓB. Skup się na znakach szczególnych. Co jeszcze charakterystycznego ma w swoim wyglądzie. Jaki kolor włosów ma?",
    );

    console.log(text);

    console.log(await sendReport("photos", text));
});
