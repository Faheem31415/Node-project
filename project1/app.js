const express=require('express');
const path=require('path');
const app=express();

const rootDir=require('./utilities/pathutil');
const {errorpage}=require('./controller/errors');
const storeRouter=require('./routes/storeRouter');

//ejs engine
app.set("view engine","ejs")
app.set("views","views")

// Middleware for static serve
app.use(express.static(path.join(rootDir,'public')));

app.use(express.urlencoded({ extended: true })); 

//routes
app.use(storeRouter);

//error handling
app.use(errorpage);




app.listen(4000,()=>{
    console.log('http://localhost:4000');
})