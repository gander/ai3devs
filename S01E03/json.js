import fs from "node:fs";
import { evaluate } from "mathjs";

async function ask(content) {
    return new Promise((resolve, reject) => {
        const options = {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.PPLX_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "sonar",
                messages: [
                    {
                        role: "system",
                        content:
                            "Keep your answers short and concise, using only the words you need. Do not add any explanation or context, reference, nothing additional.",
                    },
                    {
                        role: "user",
                        content: content,
                    },
                ],
                return_images: false,
                return_related_questions: false,
                stream: false,
            }),
        };

        fetch("https://api.perplexity.ai/chat/completions", options)
            .then((response) => response.json())
            .then((response) => resolve(response.choices[0].message.content))
            .catch((err) => reject(err));
    });
}

const input = JSON.parse(fs.readFileSync("json.txt").toString());

for (let i = 0; i < input["test-data"].length; i++) {
    input["test-data"][i].answer = evaluate(input["test-data"][i].question);
    if (input["test-data"][i].test) {
        input["test-data"][i].test.a = await ask(input["test-data"][i].test.q);
    }
}

fs.writeFileSync("json2.txt", JSON.stringify(input, undefined, 2));
