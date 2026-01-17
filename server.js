const exptess = require("express");
const app = exptess();

app.set("view engine", "ejs");
app.use(exptess.urlencoded({ extended: true }));
app.use(exptess.static("public"));

app.use(function (req, res, next) {
  res.locals.errors = [];
  next();
})

app.get("/", (req, res) => {
  res.render("homepage");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/register", (req, res) => {
  const errors = [];
  
  let user = req.body.username;
  let pass = req.body.password;
  
  // handle errors
  if (typeof user !== "string") user = "";
  if (typeof pass !== "string") pass = "";

  user = req.body.username.trim();

  if (!user) errors.push("Please provide a username.");
  if (user && user.length < 3) errors.push("Username is to short must be at least 3 characters")
  if (user && user.length > 12) errors.push("Username cannot exceed 12 characters")
  if (user && !user.match(/^[a-zA-Z0-9]+$/)) errors.push("Username can only contain a-z, A-Z letters and 0-9 numbers")

  if (!pass) errors.push("Please provide a password.");
  if (pass && pass.length < 8) errors.push("Password is to short must be at least 8 characters")
  if (pass && pass.length > 70) errors.push("Password cannot exceed 70 characters")

  if (errors.length) {
    return res.render("homepage", { errors });
  }

  // save new user to the database
  res.send("Thank you for filling out the form.");

});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
