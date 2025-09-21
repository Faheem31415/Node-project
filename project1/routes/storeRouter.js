const express=require('express');
const storeRouter=express.Router();

const homesController=require('../controller/storeController');

storeRouter.get('/added-home',homesController.addedhomepage);

storeRouter.get('/',homesController.homepage);

storeRouter.post('/registered-home',homesController.registeredpage);

storeRouter.get('/register-home',homesController.registationpage);

storeRouter.get('/added-home/:homeid',homesController.homedetailspage);


module.exports=storeRouter;