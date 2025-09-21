const express=require('express');

const AuthRouter=express.Router();

const authController=require('../controller/authController');

AuthRouter.get('/login',authController.getLogin);

AuthRouter.post('/login',authController.postLogin);

AuthRouter.post('/logout',authController.postLogout);

AuthRouter.get('/signup',authController.getSignup);


AuthRouter.post('/signup',authController.postSignup);

module.exports=AuthRouter;
