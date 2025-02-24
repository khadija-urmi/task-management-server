const express = require('express');
const app = express();
const cors = require('cors');

require('dotenv').config();

const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pbpi8.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    const userCollection = client.db("taskManager").collection("users");
    const taskCollection = client.db("taskManager").collection("taskInfo");
  
app.post('/user',async(req,res)=>{
    const user = req.body
      const result = await userCollection.insertOne(user);
      res.send(result)
})

  } finally {
   
    //await client.close();
  }
}
run().catch(console.dir);
app.get('/', (req, res) => {
    res.send('Welcome to the Task Management server');
});

app.listen(port, () => {
    console.log(`Task Management is  on port ${port}`);
})
