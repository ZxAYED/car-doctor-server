const express = require("express");
require("dotenv").config();
const cors = require("cors");
const app = express();
const jwt = require("jsonwebtoken");
const port = process.env.PORT || 5001;

const cookieParser = require("cookie-parser");

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@clusterz.ulyhy8v.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const serviceCollection = client.db("car-doctor").collection("services");
    const bookingsCollection = client.db("car-doctor").collection("bookings");
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );

    const verifyToken = async (req, res, next) => {
      const token = req.cookies?.token;
      if (!token) {
        return res.status(401).send({ message: "not authorized" }); 
      }
      jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(err,decoded)=>{
        if(err){
          console.log(err);
          return res.status(401).send({message:'Unauthorized'})
        }
        console.log('value of token'+decoded);
        req.user=decoded;
        next();
      })
     
    };

    app.post("/jwt", verifyToken, async (req, res) => {
      const user = req.body;
    

      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1h",
      });
      
      res
        .cookie("token", token, {
          httpOnly: true,
          secure: false,
          //  sameSite:'none'
        })
        .send({ success: true });
    });

    app.get("/services", async (req, res) => {
      const result = await serviceCollection.find().toArray();
      res.send(result);
    });
    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await serviceCollection.findOne(query);
      res.send(result);
    });

    app.post("/bookings", async (req, res) => {
      const bookings = req.body;

      const result = await bookingsCollection.insertOne(bookings);
      res.send(result);
    });

    app.get("/bookings", verifyToken, async (req, res) => {
      console.log(req.query.email);
      console.log(req.cookies.token);
      console.log( 'user in the valid token',req.user);
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email };
      }

      const result = await bookingsCollection.find(query).toArray();
      res.send(result);
    });

    app.delete("/bookings/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await bookingsCollection.deleteOne(query);
      res.send(result);
    });
  } finally {
    // Ensures that the client will close when you finish/error
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("doctor is running");
});
app.listen(port, () => {
  console.log("car-doctor server is runing on port ", port);
});
