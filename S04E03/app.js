import { sendReport } from "../lib";

console.log(
    await sendReport("softo", {
        "01": "kontakt@softoai.whatever",
        "02": "https://banan.ag3nts.org/",
        "03": "ISO 9001 oraz ISO/IEC 27001",
    }),
);
