const express = require('express');
const mongoose = require('mongoose');
const swaggerUi  = require('swagger-ui-express');
const swaggerFile = require('./swagger/swagger_output.json');
const usersRoute = require('./routes/users')
require('dotenv').config();
const app = express();

//middlewares
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerFile));

//routes
app.use('/api/users',usersRoute);

//connect to mongoDB
mongoose
    .connect(process.env.MONGODB_URL,{ useNewUrlParser: true, useUnifiedTopology: true })
    .then(()=>{
        console.log("connected to fish-tracker-db");
    })
    .catch(()=>{
        console.log("something went wrong connecting to the db");
    });

const PORT = process.env.PORT || 3000

app
    .listen(PORT, () =>{
        console.log("server started at PORT ", PORT);
    });
