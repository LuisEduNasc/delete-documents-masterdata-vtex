const express = require('express');
const cors = require('cors');
const axios = require('axios');
const helmet = require('helmet');

const PORT = 3001

const app = express();
app.use(cors());
app.use(helmet());

const deleteDocuments = async (data, account, entity, key, token) => {
    let deletedCount = 0;

    return new Promise(async (resolve, reject) => {
        for (let index = 0; index < data.length; index++) {
            await axios.delete(`https://${account}.vtexcommercestable.com.br/api/dataentities/${entity}/documents/${data[index].id}`, {
                headers: {
                    'content-type': 'application/json',
                    'accept': 'application/vnd.vtex.ds.v10+json',
                    'x-vtex-api-appkey': key,
                    'x-vtex-api-apptoken': token
                }
            }).then(result => {
                deletedCount++;
            }).catch(err => {
                console.log('Error', err);
                reject(err);
            });
        }
        resolve(deletedCount);
    });
}

app.get('/deleteDocuments', (req, res) => {
    const { account, entity, key, token } = req.headers;

    if(!account || !entity || !key || !token)
        return res.send('headers: account, entity, key and token are required!');
        
    
    axios.get(`https://${account}.vtexcommercestable.com.br/api/dataentities/${entity}/search?_fields=id`, {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/vnd.vtex.ds.v10+json',
            'REST-Range': 'resources=0-1000'
        }
    }).then(async result => {
        const deleted = await deleteDocuments(result.data, account, entity, key, token);
        console.log(`Finished ${deleted} documents was deleted.`);
        res.status(200).json({registersFound: result.data.length, registersDeleted: deleted});
    }).catch(err => {
        res.json({error: err});
    });
});

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});