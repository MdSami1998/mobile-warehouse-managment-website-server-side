const express = require("express");
const cors = require("cors");
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


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

        app.get('/phone', async (req, res) => {
            const query = {};
            const cursor = phoneCollection.find(query);
            const phones = await cursor.toArray();
            res.send(phones);
        })

        app.get('/phone/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const phone = await phoneCollection.findOne(query);
            res.send(phone);
        })

        app.put('/phone/:id', async (req, res) => {
            const id = req.params.id;
            const updatePhone = req.body;
            const query = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    quantity: updatePhone.quantity
                },
            };
            const result = await phoneCollection.updateOne(query, updateDoc, options);
            res.send(result);
        })

        app.delete('/phone/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await phoneCollection.deleteOne(query);
            res.send(result);
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