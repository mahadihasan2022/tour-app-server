const express = require("express");

const app = express();
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
const SSLCommerzPayment = require("sslcommerz-lts");

const port = process.env.PORT || 5000;
require("dotenv").config();

app.use(cors());
app.use(express.json());

const url = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.h8k01.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

const store_id = process.env.STORE_ID;
const store_passwd = process.env.STORE_SECRET;
const is_live = false; //true for live, false for sandbox

async function run() {
  try {
    const database = client.db("tourApp");
    const currentPackageCollection = database.collection("currentPackage");
    const bestResortCollection = database.collection("bestResort");
    const orderCollection = database.collection("order");
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

    app.put("/orders", async (req, res) => {
      const order = req.body;
      const result = await orderCollection.insertOne(order);
      res.send(result);
    });

    app.get('/orders', async (req, res) => {
      const email = req.query.email;
      const query = {email: email};
      const bookings = orderCollection.find(query);
      const products = await bookings.toArray();
      res.json(products);
    });

    // app.get("/booking", async (req, res) => {
    //   const query = {};
    //   const cursor = orderCollection.find(query);
    //   const products = await cursor.toArray();
    //   res.json(products);
    // });
     
    app.get("/user/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const findUser = await usersCollection.findOne(query);
      res.json(findUser);
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
      console.log(req.body, addUser);
      const addFriends = req.query.addFriends;
      const options = { upsert: true };
      if (addUser) {
        const newUsers = req.body;
        const filter = { email: addUser };
        const updateDoc = {
          $set: {
            displayName: newUsers?.displayName,
            email: newUsers?.email,
            img: newUsers?.img,
            phone: newUsers?.phone,
            address: newUsers?.address,
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

// app.put("/orders", async(req, res)=>{
//         const id = req.params.id;
//         const data = req.body;
//         console.log(data,id);
//         const filter = {_id:ObjectId(id)};
//         const options = {upset:true};
//         const updateDoc = {
//             $set:{
//               date:data?.date,
//               groupSize:data?.groupSize,
//               phone:data?.phone,

//             },
//         };
//         const result = await orderCollection.insertOne(filter,updateDoc,options);
//         res.send(result);
//     })
