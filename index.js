const express = require('express');
const mongoose = require('mongoose');
const swaggerUi  = require('swagger-ui-express');
const swaggerFile = require('./swagger/swagger_output.json');
const usersRoute = require('./routes/users');
const winston = require('winston');
const { error } = require('winston');
require('dotenv').config();
const app = express();

//middlewares
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerFile));


//craate a logger
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { service: 'user-service' },
    transports: [
        //
        // - Write all logs with level `error` and below to `error.log`
        // - Write all logs with level `info` and below to `combined.log`
        //
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
app.use('/api/users',usersRoute);
    
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
    });
