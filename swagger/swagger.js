const swaggerAutogen = require("swagger-autogen")();

const swaggerDefinition = {
  info: {
    title: "Express API for FishTrackerApp",
    version: "1.0.0",
  },
  host: "localhost:3000",
  basePath: "/api",

  securityDefinitions: {
    bearerAuth: {
      type: "apiKey",
      in: "header",
      name: "Authorization",
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
  schemes: ["http", "https"],
  consumes: ["application/json"],
  produces: ["application/json"],
};

const outputFile = "./swagger/swagger_output.json";
const endpointsFiles = ["./routes/users.js"];
swaggerAutogen(outputFile, endpointsFiles, swaggerDefinition).then(() => {
  require("../index"); // Your project's root file
});
