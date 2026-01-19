require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const exptess = require("express");
const app = exptess();
const db = require("better-sqlite3")("ourApp.db");
db.pragma("journal_mode = WAL");

// setup database
const createTables = db.transaction(() => {
	db.prepare(
		`
    	CREATE TABLE IF NOT EXISTS users (
    	id INTEGER PRIMARY KEY AUTOINCREMENT,
    	username TEXT NOT NULL UNIQUE,
    	password TEXT NOT NULL )
    	`,
	).run();
});

createTables();
// end setup database

app.set("view engine", "ejs");
app.use(exptess.urlencoded({ extended: false }));
app.use(exptess.static("public"));
app.use(cookieParser());

app.use(function (req, res, next) {
	res.locals.errors = [];

	// try to decode incoming cookie
	try {
		const decoded = jwt.verify(
			req.cookies.simpleApp,
			process.env.JWTSECRETS,
		);
		req.user = decoded;
	} catch (err) {
		req.user = false;
	}
	res.locals.user = req.user;
	console.log(req.user);

	next();
});

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

	user = user.trim();

	if (!user) errors.push("Please provide a username.");
	if (user && user.length < 3)
		errors.push("Username is to short must be at least 3 characters");
	if (user && user.length > 12)
		errors.push("Username cannot exceed 12 characters");
	if (user && !user.match(/^[a-zA-Z0-9]+$/))
		errors.push(
			"Username can only contain a-z, A-Z letters and 0-9 numbers",
		);

	if (!pass) errors.push("Please provide a password.");
	if (pass && pass.length < 8)
		errors.push("Password is to short must be at least 8 characters");
	if (pass && pass.length > 70)
		errors.push("Password cannot exceed 70 characters");

	// if any errors show homepage and errors
	if (errors.length) {
		return res.render("homepage", { errors });
	}
	// else

	// save new user to the database
	const salt = bcrypt.genSaltSync(10);
	pass = bcrypt.hashSync(pass, salt); // encrypt password

	const insertUser = db.prepare(
		"INSERT INTO users (username, password) VALUES (?, ?)",
	);
	const result = insertUser.run(user, pass);

	// lookup user id, name, pass
	const lookupStatment = db.prepare("SELECT * FROM users WHERE ROWID = ?");
	const ourUser = lookupStatment.get(result.lastInsertRowid);

	//set cookie value
	const tokenValue = jwt.sign(
		{
			exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
			userid: ourUser.id,
			username: ourUser.username,
		},
		process.env.JWTSECRETS,
	);

	// log the user by giving them a cookie
	res.cookie("simpleApp", tokenValue, {
		httpOnly: true,
		secure: true,
		sameSite: "strict",
		maxAge: 1000 * 60 * 60 * 24,
	});

	res.send("Thank you for filling out the form.");
});

app.listen(3000, () => {
	console.log("Server is running on port 3000");
});
