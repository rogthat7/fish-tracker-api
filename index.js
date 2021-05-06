const express = require('express');
const mongoose = require('mongoose');

require('dotenv').config();

const app = express();

//connect to mongoDB
mongoose.connect(process.env.MONGODB_URL,
{ useNewUrlParser: true, useUnifiedTopology: true }).then(()=>{
    console.log("connected to fish-tracker-db");
}).catch(()=>{
    console.log("something went wrong connecting to the db");
});

const PORT = process.env.PORT || 3000

app.listen(PORT, () =>{
    console.log("server started at PORT ", PORT);
});
