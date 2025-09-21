exports.Error=(req,res)=>{
    res.status(404).render('error',{pagetitle:"Error"});
}