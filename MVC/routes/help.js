const express=require('express');
const helprouter=express.Router();

const {gotoHelp}=require('../controllers/homes.js');
 
helprouter.get('/help',gotoHelp);

exports.helprouter=helprouter;