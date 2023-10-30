const express =require('express')
const cors =require('cors')
const app =express()
const port =process.env.PORT || 5002;
require('dotenv').config()

app.use(cors())
app.use(express.json())



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@clusterz.ulyhy8v.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const serviceCollection=client.db('car-doctor').collection('services')
    const bookingsCollection=client.db('car-doctor').collection('bookings')
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    app.get('/services',async(req,res)=>{
   

      const result =await serviceCollection.find().toArray() 
      res.send(result)
    })
    app.get('/services/:id',async(req,res)=>{
      const id =req.params.id
      const query ={_id :new ObjectId(id)}
      const result = await serviceCollection.findOne(query)
      res.send(result)

    })
app.post('/bookings',async(req,res)=>{
  const  bookings = req.body


const result= await bookingsCollection.insertOne(bookings)
res.send(result)
})






  } finally {
    // Ensures that the client will close when you finish/error
  
  



  }
}
run().catch(console.dir);


app.get('/',(req,res)=>{
    res.send('doctor is running')
})
app.listen(port,()=>{
    console.log("car-doctor server is runing on port ",port);
})