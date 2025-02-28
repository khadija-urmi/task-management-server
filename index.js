require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");

const port = process.env.PORT || 5000;

const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://cute-adjustment.surge.sh",
    "https://my-tasks-manager-server.vercel.app",
  ],
  methods: ["GET", "POST", "PATCH", "DELETE"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pbpi8.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const userCollection = client.db("taskManager").collection("users");
    const taskCollection = client.db("taskManager").collection("taskInfo");
    //add a user
    app.post("/user", async (req, res) => {
      const user = req.body;
      const result = await userCollection.insertOne(user);
      res.send(result);
    });

    //add a task
    app.post("/tasks", async (req, res) => {
      const task = req.body;
      const result = await taskCollection.insertOne(task);
      res.send(result);
    });

    //get all task
    app.get("/all-tasks", async (req, res) => {
      const result = await taskCollection.find().toArray();
      res.send(result);
    });

    //get only 1 userEmail task
    app.get("/tasks/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await taskCollection.find(query).toArray();
      res.send(result);
    });

    //delete task
    app.delete("/tasks/:id", async (req, res) => {
      const id = req.params.id;
      try {
        const result = await taskCollection.deleteOne({
          _id: new ObjectId(id),
        });
        if (result.deletedCount === 0) {
          return res.status(404).send({ message: "Task not found" });
        }
        res.send({ message: "Task deleted successfully" });
      } catch (error) {
        console.error("Error deleting task:", error);
        res.status(500).send({ message: "Failed to delete task" });
      }
    });

    //update the status here
    app.patch("/tasks/:id", async (req, res) => {
      const id = req.params.id;
      const { status } = req.body;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: { status },
      };
      const result = await taskCollection.updateOne(filter, updateDoc);
      res.send(result);
    });
    //update the task
    app.put("/tasks/:id", async (req, res) => {
      const id = req.params.id;
      const { title, description } = req.body;

      if (!title || !description) {
        return res
          .status(400)
          .send({ message: "Title and description are required." });
      }

      try {
        const filter = { _id: new ObjectId(id) };
        const updateDoc = {
          $set: {
            title: title,
            description: description,
          },
        };

        const result = await taskCollection.updateOne(filter, updateDoc);

        if (result.modifiedCount === 0) {
          return res.status(404).send({ message: "Task not found" });
        }

        res.send({ message: "Task updated successfully" });
      } catch (err) {
        console.error("Error updating task:", err);
        res.status(500).send({ message: "Failed to update task" });
      }
    });
  } finally {
    //await client.close();
  }
}
run().catch(console.dir);
app.get("/", (req, res) => {
  res.send("Welcome to the Task Management server");
});

app.listen(port, () => {
  console.log(`Task Management is  on port ${port}`);
});
