const express=require('express');
const abourouter=express.Router();

const {gotoAbout}=require('../controllers/homes.js');


abourouter.get('/about',gotoAbout );
exports.abourouter=abourouter;

