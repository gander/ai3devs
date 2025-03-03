import { sendReport } from "../lib";

await sendReport(
    "gps",
    {
        Rafał: {
            lat: 53.452,
            lon: 18.759,
        },
        Azazel: {
            lat: 52.229,
            lon: 21.012,
        },
        Samuel: {
            lat: 54.361,
            lon: 18.631,
        },
    },
    true,
    true,
);
