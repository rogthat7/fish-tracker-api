const express = require('express');
const mongoose = require('mongoose');
const swaggerUi  = require('swagger-ui-express');
const swaggerFile = require('./swagger/swagger_output.json');
const usersRoute = require('./routes/users_route');
const authRoute = require('./routes/auth_route');
const pjson =  require('./package.json');
const PORT = process.env.PORT || 3000
var cors = require('cors');
const clientTwilio = require('twilio')(process.env.MOBILEOTPACCOUNTID, process.env.MOBILEOTPAUTHTOKEN);
const winston = require('winston');
require('dotenv').config();
const app = express();

// Get
app.get('/api',  async (req, res, next) => {
    res.send(
            JSON.stringify(
                    {
                        name:"fish-tracker-api" ,
                        version: "v"+pjson.version,
                        swaggerDoc: "To View Swagger Documentation click <a href= "+req.protocol+"://"+req.headers.host+"/api/swagger> here </a>"
                    }
                )
            );
        });


//middlewares
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({extended:true}));
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerFile));


//craate a logger
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { service: 'fish-tracker-service' },
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
app.use('/api',authRoute);
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
        logger.info("connected to "+process.env.MONGODB_URL);
    })
    .catch((error)=>{
        logger.error("something went wrong connecting to the db",error);
    });



app
    .listen(PORT, () =>{
        logger.info(`Server started at PORT ${PORT}`);
    });
module.exports = logger;
module.exports = clientTwilio;
