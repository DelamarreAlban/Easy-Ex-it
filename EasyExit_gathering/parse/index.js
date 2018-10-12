// Example express application adding the parse-server module to expose Parse
// compatible API routes.

var express = require('express');
var ParseServer = require('parse-server').ParseServer;
var ParseDashboard = require('parse-dashboard');
var path = require('path');

require('dotenv').config()

var api = new ParseServer({
  // basics
  databaseURI: process.env.DATABASE_URI,
  cloud: __dirname + '/cloud/main.js',
  appId: process.env.APP_ID,
  masterKey: process.env.MASTER_KEY,
  serverURL: process.env.SERVER_URL,
  //publicServerURL: process.env.PUBLIC_SERVER_URL,
  verifyUserEmails: false,
  emailVerifyTokenValidityDuration: 2 * 60 * 60, // 2 hours
  preventLoginWithUnverifiedEmail: false,
  publicServerURL: process.env.SERVER_URL,
  appName: process.env.APP_NAME,
  logLevel: "ERROR",

  // email stuff
  emailAdapter: {
    module: 'parse-server-simple-nodemailer-adapter',
    options: {
      senderName: process.env.APP_NAME,
      fromAddress: process.env.EMAIL_NAME,
      user: process.env.EMAIL_NAME,
      password: process.env.EMAIL_PASS
    }
  },

  customPages: {
    choosePassword: process.env.FORGOT_RESET_URL,
    passwordResetSuccess: process.env.FORGOT_SUCCESS_URL
  }
});
// Client-keys like the javascript key or the .NET key are not necessary with parse-server
// If you wish you require them, you can set them as options in the initialization above:
// javascriptKey, restAPIKey, dotNetKey, clientKey

var dashboard = new ParseDashboard({
  "apps": [
    {
      "serverURL": process.env.SERVER_URL,
      //"serverURL": process.env.PUBLIC_SERVER_URL,  // Don't forget to change to https if needed,
      "appId": process.env.APP_ID,
      "masterKey": process.env.MASTER_KEY, //Add your master key here. Keep it secret!,
      "appName": process.env.APP_NAME
    }
  ],
  "users": [
    {
      "user":"node",
      "pass":"$2y$10$3ju1FlS2ys7/UMkzL4UBl.leti0qr1UMMSjXlFjYZ9iNMdF8sVnAa"
    }
  ],
  "useEncryptedPasswords": true
}, { allowInsecureHTTP: true });

var app = express();

// make the Parse Dashboard available at /dashboard
app.use('/dashboard', dashboard);

// Serve the Parse API on the /parse URL prefix
var mountPath = process.env.PARSE_MOUNT;
app.use(mountPath, api);

app.use('/password', express.static(path.join(__dirname, '/password')));

// Serve static assets from the /public folder
app.use('/', express.static(path.join(__dirname, '/public')));

app.use(function (err, req, res, next) {
  console.error(err.stack)
  res.status(500).send('Something broke!')
})

var port = process.env.PORT;
var httpServer = require('http').createServer(app);
httpServer.listen(port, 'localhost', function() {
    console.log('parse-server-example running on port ' + port + '.');
});

// This will enable the Live Query real-time server
ParseServer.createLiveQueryServer(httpServer);
