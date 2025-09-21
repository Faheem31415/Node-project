const express = require('express');
const path = require('path');
const app = express();

const homerouter= require('./routes/homerouter');
const formrouter=require('./routes/formrouter');
const {subrouter}=require('./routes/submitrouter');
const rootDir=require('./utilities/pathutil');
const {Error}=require('./controllers/errors');
const {registeredrouter}=require('./routes/registeredrouter');
const {abourouter}=require('./routes/about');
const {helprouter}=require('./routes/help');


app.set("view engine","ejs")
app.set("views","views")

// Middleware for static serve
app.use(express.static(path.join(rootDir,'public')));

app.use(express.urlencoded({ extended: true })); 

// Routers
app.use(homerouter);
app.use(formrouter);
app.use(subrouter);
app.use(registeredrouter);
app.use(abourouter);
app.use(helprouter);

//Error handling
app.use(Error);


const PORT = 3000;

 // Start the server
 app.listen(PORT, () => {
   console.log(`Server is running on http://localhost:${PORT}`);
 });
 

