import fs from 'fs/promises'

async function fetchData(query){
    return new Promise(async (resolve, reject) => {
        const response = await fetch('https://centrala.ag3nts.org/apidb', {
            method: 'POST',
            body: JSON.stringify({
                "task": "database",
                "apikey": process.env.AZYL_API_KEY,
                "query": query
            })
        })

        const {reply, error} = await response.json()

        if (error === 'OK') {
            resolve(reply);
        } else {
            reject(error);
        }
    })
}

// const tables = await fetchData('show tables');
//
// for (const {Tables_in_banan: table} of tables) {
//     console.log(await fetchData(`show create table ${table}`));
// }



// const response = await fetch('https://centrala.ag3nts.org/report', {
//     method: 'POST',
//     body: JSON.stringify({
//         "task": "database",
//         "apikey": process.env.AZYL_API_KEY,
//         "answer": [4278, 9294],
//     })
// });
//
// console.log(await response.text());

// await fs.writeFile('connections.json', JSON.stringify(await fetchData('select * from connections')));
// await fs.writeFile('correct_order.json', JSON.stringify(await fetchData('select * from correct_order order by weight')));
await fs.writeFile('flag.txt', JSON.stringify(await fetchData('SELECT GROUP_CONCAT(letter ORDER BY weight SEPARATOR "") as result FROM correct_order')));
// await fs.writeFile('datacenters.json', JSON.stringify(await fetchData('select * from datacenters')));
// await fs.writeFile('users.json', JSON.stringify(await fetchData('select * from users')));
