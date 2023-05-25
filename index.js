const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
const port = process.env.PORT || 5000;
require("dotenv").config();

app.use(cors());
app.use(express.json());

// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.h8k01.mongodb.net/?retryWrites=true&w=majority`;
const url = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.h8k01.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    const database = client.db("tourApp");
    const currentPackageCollection = database.collection("currentPackage");
    const bestResortCollection = database.collection("bestResort");
    const usersCollection = database.collection("users");




  //-------------------------------
          // Home Section
  //-------------------------------
     app.get("/currentPackage", async (req, res) => {
        const query = {};
        const cursor = currentPackageCollection.find(query);
        const products = await cursor.toArray();
        res.json(products);
      });
      app.get("/currentPackage/:id", async (req, res) => {
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        const buy = await currentPackageCollection.findOne(query);
        res.send(buy);
      });

     app.get("/bestResort", async (req, res) => {
        const query = {};
        const cursor = bestResortCollection.find(query);
        const products = await cursor.toArray();
        res.json(products);
      });

       app.get("/bestResort/:id", async (req, res) => {
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        const buy = await bestResortCollection.findOne(query);
        res.send(buy);
      });



      app.get("/user", async (req, res) => {
        const getUserEmail = req?.query?.email;
        if (getUserEmail) {
          const query = { email: getUserEmail };
          const user = await usersCollection.findOne(query);
          res.json(user);
        } else {
          const cursor = usersCollection.find({});
          const users = await cursor.toArray();
          res.json(users);
        }
      });
  
      app.put("/user", async (req, res) => {
        const addUser = req.query.addUser;
        const addFriends = req.query.addFriends;
        const options = { upsert: true };
        if (addUser) {
          const newUsers = req.body;
          const filter = { email: addUser };
          const updateDoc = {
            $set: {
              name: newUsers?.name,
              email: newUsers?.email,
              img: newUsers?.img,
            },
          };
          const result = await usersCollection.updateOne(
            filter,
            updateDoc,
            options
          );
          // console.log(result)
          res.send(result);
        }
        if (addFriends) {
          const newFriends = req.body;
          // console.log(newFriends)
          const filter = { email: addFriends };
          const updateDoc = {
            $set: { friends: newFriends },
          };
          const result = await usersCollection.updateOne(
            filter,
            updateDoc,
            options
          );
          res.send(result);
        }
      });


 
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Trip Your Tour Ready!!!");
});

app.listen(port, () => {
  console.log(`http://localhost:${port}`);
});