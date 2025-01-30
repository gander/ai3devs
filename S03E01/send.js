import fs from "node:fs";

const response = await fetch("https://centrala.ag3nts.org/report", {
    method: "POST",
    body: JSON.stringify({
        task: "dokumenty",
        apikey: process.env.AZYL_API_KEY,
        answer: {
            "2024-11-12_report-00-sektor_C4.txt":
                "Aleksander Ragowski, sektor C4, jednostka organiczna, skan biometryczny, dział kontroli, nauczyciel",
            "2024-11-12_report-01-sektor_A1.txt":
                "sektor A1, lokalna zwierzyna, fałszywy alarm, spokój",
            "2024-11-12_report-03-sektor_A3.txt":
                "sektor A3, czujniki, życie organiczne, monitoring, patrol",
            "2024-11-12_report-08-sektor_A1.txt":
                "sektor A1, monitoring, czujniki, obserwacja, cisza",
            "2024-11-12_report-07-sektor_C4.txt":
                "Barbara Zawadzka, sektor C4, nadajnik ultradźwiękowy, dział śledczy, frontend developer, javascript programista",
            "2024-11-12_report-02-sektor_A3.txt":
                "sektor A3, patrol nocny, cichy, monitoring, obszar",
            "2024-11-12_report-06-sektor_C2.txt":
                "sektor C2, północno-zachodni, skanery, brak wykrycia, patrol",
            "2024-11-12_report-04-sektor_B2.txt":
                "sektor B2, zachodni teren, brak anomalii, bezpieczny, kanały komunikacyjne",
            "2024-11-12_report-09-sektor_C2.txt":
                "sektor C2, peryferia zachodnie, brak sygnałów, patrol, cykl",
            "2024-11-12_report-05-sektor_C1.txt":
                "sektor C1, aktywność organiczna, sensor dźwiękowy, detektory ruchu, gotowość, monitoring",
        },
    }),
});

console.log(await response.text());
