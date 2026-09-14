// 404 handler — catches all unmatched routes
exports.notFoundPage = (req, res) => {
  res.status(404).render("error", {
    pagetitle: "Page Not Found",
    isLogin: req.isLogin,
    user: req.session.user || null,
    statusCode: 404,
    message: "The page you are looking for does not exist.",
  });
};

// Express error handler — must have exactly 4 arguments
// eslint-disable-next-line no-unused-vars
exports.errorpage = (err, req, res, next) => {
  console.error("Application error:", err);
  res.status(err.status || 500).render("error", {
    pagetitle: "Something Went Wrong",
    isLogin: req.isLogin,
    user: req.session.user || null,
    statusCode: err.status || 500,
    message:
      process.env.NODE_ENV === "production"
        ? "An unexpected error occurred. Please try again later."
        : err.message || "Internal Server Error",
  });
};
