const exptess = require("express");
const app = exptess();

app.set("view engine", "ejs");
app.use(exptess.urlencoded({ extended: true }));
app.use(exptess.static("public"));

app.get("/", (req, res) => {
  res.render("homepage");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/register", (req, res) => {
  const errors = [];

  if (typeof req.body.username !== "string") req.body.username = "";
  if (typeof req.body.password !== "string") req.body.password = "";
  req.body.username = req.body.username.trim();

  if (req.body.username === "") errors.push("Please provide a username.");
  if (req.body.password === "") errors.push("Please provide a password.");
  if (errors.length) {
    return res.render("homepage", { errors });
  } else {
    res.send("Thank you for filling out the form.");
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
