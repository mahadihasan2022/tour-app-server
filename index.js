const express = require("express");
const bodyParser = require('body-parser')
const app = express();
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;

const SSLCommerzPayment = require('sslcommerz-lts')
const store_id = process.env.STORE_ID;
const store_passwd = process.env.STORE_SECRET;
const is_live = false; //true for live, false for sandbox

const port = process.env.PORT || 5000;
require("dotenv").config();


app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());

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
    const orderCollection = database.collection("order");
    const resortOrderCollection = database.collection("resortOrder");
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
    app.get("/orders", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const bookings = orderCollection.find(query);
      const products = await bookings.toArray();
      res.json(products);
    });
    app.put("/resortOrders", async (req, res) => {
      const order = req.body;
      const result = await resortOrderCollection.insertOne(order);
      res.send(result);
    });
    app.get("/resortOrders", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const bookings = resortOrderCollection.find(query);
      const products = await bookings.toArray();
      res.json(products);
    });
    app.delete("/resortOrders", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      console.log(query);
      const result = await resortOrderCollection.deleteOne(query);
      res.send(result);
    });
    app.delete("/orders", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      console.log(query);
      const result = await orderCollection.deleteOne(query);
      res.send(result);
    });
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

    app.get('/ssl-payment', (req, res) => {
      const data = {
          total_amount: 4100,
          currency: 'BDT',
          tran_id: 'REF123', // use unique tran_id for each api call
          success_url: 'http://localhost:5000/success',
          fail_url: 'http://localhost:3030/fail',
          cancel_url: 'http://localhost:3030/cancel',
          ipn_url: 'http://localhost:3030/ipn',
          shipping_method: 'Courier',
          product_name: 'Computer.',
          product_category: 'Electronic',
          product_profile: 'general',
          cus_name: 'Customer Name',
          cus_email: 'customer@example.com',
          cus_add1: 'Dhaka',
          cus_add2: 'Dhaka',
          cus_city: 'Dhaka',
          cus_state: 'Dhaka',
          cus_postcode: '1000',
          cus_country: 'Bangladesh',
          cus_phone: '01711111111',
          cus_fax: '01711111111',
          ship_name: 'Customer Name',
          ship_add1: 'Dhaka',
          ship_add2: 'Dhaka',
          ship_city: 'Dhaka',
          ship_state: 'Dhaka',
          ship_postcode: 1000,
          ship_country: 'Bangladesh',
      };
      const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live)
      sslcz.init(data).then(apiResponse => {
          // Redirect the user to payment gateway
          let GatewayPageURL = apiResponse.GatewayPageURL
          res.send({GatewayPageURL})
          console.log('Redirecting to: ', GatewayPageURL)
      });
      app.get('/success/:tran_id', async (req, res) => {
        console.log();
      })
  })
    





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


