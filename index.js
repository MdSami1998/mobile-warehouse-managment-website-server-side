const express = require("express");
const cors = require("cors");
require('dotenv').config()
const { MongoClient, ServerApiVersion } = require('mongodb');


const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.4kbjf.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
console.log('hello world')

async function run() {
    try {
        await client.connect();
        const phoneCollection = client.db("warehouse").collection("phone");

        app.get('/phones', async (req, res) => {
            const query = {};
            const cursor = phoneCollection.find(query);
            const phones = await cursor.toArray();
            res.send(phones);
        })
    }
    finally {

    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('hello mama!!!!')
});

app.listen(port, () => {
    console.log('Listening to port,', port)
})