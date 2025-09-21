const express=require('express');

const userRouter=express.Router();

const userController=require('../controller/userControllers');

userRouter.get('/',userController.homepage);

userRouter.get("/user/homes-list",userController.homeslistpage);

userRouter.get('/user/home-bookings',userController.bookingpage);

userRouter.get('/user/favourites',userController.favouritepage);



//form
userRouter.get('/user/home-list/home-details/:homeid',userController.homedetailspage);

userRouter.post('/user/home-list/favourites/:homeid',userController.postaddfavourite);



userRouter.post('/user/favourites/remove/:homeid',userController.removefavourites);

module.exports=userRouter;