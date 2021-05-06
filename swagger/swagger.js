const swaggerAutogen = require('swagger-autogen')();

const swaggerDefinition = {
    info: {
      title: 'Express API for JSONPlaceholder',
      version: '1.0.0',
    },
    host: "localhost:3000",
    basePath: "/api/users",
    securityDefinitions: {
      api_key: {
          type: "apiKey",
          name: "api_key",
          in: "header"
      },
      petstore_auth: {
          type: "oauth2",
          authorizationUrl: "https://petstore.swagger.io/oauth/authorize",
          flow: "implicit",
          scopes: {
              users_endpoint: "read your pets"
          }
      }
  },
    schemes: ['http'],
    consumes: ['application/json'],
    produces: ['application/json'],
    securityDefinitions: {
      api_key: {
          type: "apiKey",
          name: "api_key",
          in: "header"
      },
    },
  };

const outputFile = './swagger/swagger_output.json';
const endpointsFiles = ['./routes/users.js'];
swaggerAutogen(outputFile, endpointsFiles, swaggerDefinition).then(() => {
    require('../index')           // Your project's root file
});