const express = require("express");
const cors = require("cors");
const jwt = require('jsonwebtoken');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


const app = express();
const port = process.env.PORT || 5000;
// middlware 
app.use(cors());
app.use(express.json());

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized access' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: 'forbidden access' });
        }
        // console.log("decoded", decoded);
        req.decoded = decoded;
        next();
    })
}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.4kbjf.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
console.log('hello world')

async function run() {
    try {
        await client.connect();
        const phoneCollection = client.db("warehouse").collection("phone");
        const membersCollection = client.db("warehouse").collection("teamMembers");

        // get all collection API
        app.get('/phone', async (req, res) => {
            const query = {};
            const cursor = phoneCollection.find(query);
            const phones = await cursor.toArray();
            res.send(phones);
        })
        // team members api collection 
        app.get('/members', async (req, res) => {
            const query = {};
            const cursor = membersCollection.find(query);
            const members = await cursor.toArray();
            res.send(members);
        })

        // get single collection API
        app.get('/phone/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const phone = await phoneCollection.findOne(query);
            res.send(phone);
        })

        // my items collection API 
        app.get('/myitems', verifyJWT, async (req, res) => {
            const decodedEmail = req.decoded.email;
            const email = req.query.email;
            if (email === decodedEmail) {
                const query = { email: email };
                const cursor = phoneCollection.find(query);
                const items = await cursor.toArray();
                res.send(items);
            }
            else {
                res.status(403).send({ message: 'forbidden access' })
            }
        })

        // update quantity
        app.put('/phone/:id', async (req, res) => {
            const id = req.params.id;
            const updatePhone = req.body;
            const query = { _id: ObjectId(id) };
            const updateDoc = {
                $set: {
                    quantity: updatePhone.quantity
                },
            };
            const options = { upsert: true };
            const result = await phoneCollection.updateOne(query, updateDoc, options);
            res.send(result);
        })

        // delete single item API
        app.delete('/phone/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await phoneCollection.deleteOne(query);
            res.send(result);
        })

        // post a new item in DB
        app.post('/phone', async (req, res) => {
            const newPhone = req.body;
            const result = await phoneCollection.insertOne(newPhone);
            res.send(result);
        })

        // access token 

        app.post('/login', async (req, res) => {
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '1d'
            });
            res.send({ accessToken });
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