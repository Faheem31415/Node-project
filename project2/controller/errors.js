exports.errorpage = (req, res) => {
  res.render("error", { pagetitle: "Error", isLogin: req.isLogin,user: req.session.user });
};
