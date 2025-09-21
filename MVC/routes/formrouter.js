const express=require('express');

const formrouter=express.Router();

const {gotoForm}=require('../controllers/homes');

formrouter.get('/submit',gotoForm);



module.exports=formrouter;