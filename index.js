const express = require('express')
const app = express()
var cors = require('cors')
const port = process.env.PORT || 5000;
const jwt = require('jsonwebtoken');
require('dotenv').config()


// Use Middleware
app.use(cors())
app.use(express.json())


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://gadgetUser:xxyA0Oam3QjUj9Ja@cluster0.fgazbky.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const gadgetCollction = client.db("gadgetCollction").collection("gadgets");

        // Json Token Generator in Login
        app.post('/login', (req, res) => {
            const email = req.body.email;
            const token = jwt.sign(email, process.env.ACCESS_SECRET_TOKEN);
            res.send({ token })
        })

        app.get('/gadgetsAll', async (req, res) => {
            const query = {};
            const cursor = gadgetCollction.find(query);
            const result = await cursor.toArray();
            res.send(result);
        })

        app.post('/gadgetsAll', async (req, res) => {
            const gadget = req.body;
            const tokenInfo = req.headers.authorization;
            const [email, token] = tokenInfo.split(' ');
            const decodedEmail = verifyToken(token);
            // console.log(decodedEmail);
            if (email === decodedEmail) {
                const result = await gadgetCollction.insertOne(gadget);
                res.send(result);
            }
            else {
                res.send({ message: 'UnAuthorize Access' })
            }
        })
    }
    finally {
        // await client.close()
    }
}
run().catch(console.dir)


function verifyToken(token) {
    let email;
    jwt.verify(token, process.env.ACCESS_SECRET_TOKEN, function (err, decoded) {
        if (err) {
            email = 'Invalid Email'
        }
        else {
            email = decoded;
        }
    })
    return email;
}

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})