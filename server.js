const exptess = require("express");
const app = exptess();

app.get("/", (req, res) => {
  res.send("Hello World! from express");
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
