
exports.gotoForm = (req, res) => {
    res.render('form', { pagetitle: "Submit" });
};

exports.submitDetails = (req, res) => {
   
    res.render('submit', {  pagetitle: 'Submit' });
};

exports.gotoHome = (req, res) => {
    res.render('home', { pagetitle: "Home" });
};


exports.gotoRegistered = (req, res) => {
    res.render('registered', {pagetitle: "Registered" });
};


exports.gotoAbout = (req, res) => {
    res.render('about', { pagetitle: "About" });
};


exports.gotoHelp = (req, res) => {
    res.render('help', { pagetitle: "Help" });
};