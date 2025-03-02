import { sendReport } from "../lib";

console.log(await sendReport("webhook", "https://rancor.gander.dev/api/drone"));
