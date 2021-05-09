const express = require('express');
const mongoose = require('mongoose');
const swaggerUi  = require('swagger-ui-express');
const swaggerFile = require('./swagger/swagger_output.json');
const usersRoute = require('./routes/users');
const pjson =  require('./package.json');
const clientTwilio = require('twilio')(process.env.MOBILEOTPACCOUNTID, process.env.MOBILEOTPAUTHTOKEN);
const winston = require('winston');
require('dotenv').config();
const app = express();

// Get
app.get('/api',  async (req, res, next) => {
    res.send("Welcome to fish-tracker-api v"+pjson.version+"</br>To View Swagger Documentation click <a href= "+req.protocol+"://"+req.headers.host+"/api/swagger> here </a>");
});


//middlewares
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use('/api/swagger', swaggerUi.serve, swaggerUi.setup(swaggerFile));


//craate a logger
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { service: 'user-service' },
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.Console({
            format:winston.format.combine(
                winston.format.colorize({all:true})
                )
            })
        ],
        exceptionHandlers:[
            new winston.transports.File({ filename: 'exceptions.log' }),
        ],
    });

//routes
app.use('/api',usersRoute);

app.use(async(req,res,next)=>{
    const error = new Error("No Found");
    error.status = 404;
    next(error); 
});

app.use((err, req, res, next)=>{
    res.status(err.status || 500);
    res.send({
        error:{
            status:err.status || 500,
            message:err.message, 
        },
    });
})  
//connect to mongoDB
mongoose
    .connect(process.env.MONGODB_URL,{ useNewUrlParser: true, useUnifiedTopology: true })
    .then(()=>{
        logger.info("connected to fish-tracker-db");
    })
    .catch((error)=>{
        logger.error("something went wrong connecting to the db",error);
    });

const PORT = process.env.PORT || 3000

app
    .listen(PORT, () =>{
        logger.info(`Server started at PORT ${PORT}`);
        logger.info(`User Secrete ${process.env.SECRETE}`);
    });
module.exports = logger;
module.exports = clientTwilio;