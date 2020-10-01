const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');

const generateRandomString = require("./helpers");
const getUserbyEmail = require("./helpers");
const getUserby = require("./helpers");
const urlsForUser = require("./helpers");
//app middleware---------------------------------------
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
//app.use(cookieParser());
app.use(cookieSession({
  user_ID: 'session',
  keys: ['scaryKeyScary'],
  maxAge: 5 * 60 * 1000
}));
//app constants and variables---------------------------------
//old DB
// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" },
  imog4n: { longURL: "https://www.reddit.ca", userID: "h3h3h3" },
  h4455i: { longURL: "https://www.mec.ca", userID: "h3h3h3" }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  },
  "5cWQpK": {
    id: "aJ48lW",
    email: "kenny@pulitzer.net",
    password: "$2b$10$A4IaTVv9lpzO9XR1gf4BLOWMVe99J20QyPF2H5rDy4YD8Lf2c49gG"
  },

};

//View routes
app.get("/", (req, res) => {
  res.send("hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
//renders url page
app.get("/urls", (req, res) => {
  const user_id = req.session.user_id;
  console.log(user_id, "USER_ID");
  const user = users[user_id];
  console.log(user, "UUSER TEST");
  if (!user_id) {
    res.redirect("/login");
  }
  console.log("TEST USER ID", user_id);
  let userURLs = urlsForUser(user_id);
  console.log((userURLs), "USER URLS TEST");
  // console.log(username, "user_id");
  // console.log(req.cookies, "req.cookies");
  //console.log(user);
  const templateVars = { urls: userURLs, user, };
  //console.log(user_id);
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let user_id = req.session.user_id;
  const user = users[user_id];
  const templateVars = {
    user,
    users
  };
  if (!user_id) {
    res.redirect("/login");
  } else {
    res.render("urls_new", templateVars);
  }
});
//edit individual URLS page
app.get("/urls/:shortURL", (req, res) => {
  const user_id = req.session.user_id;
  if (!user_id) {
    res.redirect("/login");
  }

  const user = users[user_id];
  const shortURL = req.params.shortURL;
  const urlRecord = urlDatabase[shortURL];
  //let userURLs = urlsForUser(user_id);
  //checking if user should have access to page
  if (urlRecord.userID !== user_id) {
    res.status(401).send("You do not have access to this URL, please login with appropriate credentials and try again");
  }

  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlRecord.longURL,
    user,
    users
  };
  res.render("urls_show", templateVars);
});

//redirects to long URL
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const urlRecord = urlDatabase[shortURL];
  res.redirect(urlRecord.longURL);
});

//renders registration page
app.get("/register", (req, res) => {
  let user_id = req.session.user_id;
  const user = users[user_id];

  const templateVars = { user, users };
  res.render("registration", templateVars);
});
//renders login page
app.get("/login", (req, res) => {
  let user_id = req.session.user_id;
  const user = users[user_id];
  const templateVars = { user, users };
  if (user_id) {
    res.redirect("/urls");
  }
  res.render("login", templateVars);
});
//===========================================================
//POST Routes
//adds new URL to db

app.post("/urls", (req, res) => {
  let newURL = generateRandomString();
  let cookie = req.session.user_id;
  console.log(req.body.longURL, "TESTY");
  const inputURL = req.body.longURL;
  if (!cookie) {
    res.redirect("/login");
  }
  urlDatabase[newURL] = {
    longURL: inputURL,
    userID: cookie
  };
  res.redirect(`/urls/${newURL}`);
});

//actually deletes a URL
app.post("/urls/:shortURL/delete", (req, res) => {
  //console.log(req.params.shortURL)
  const shortURL = req.params.shortURL;
  const user = /*req.cookies["user_id"]*/req.session.user_id;
  const urlRecord = urlDatabase[shortURL];
  if (user === urlRecord.userID) {
    delete urlRecord;
  }
  res.redirect("/urls");
});

//edits a URL
app.post("/urls/:id", (req, res) => {
  // console.log(req.params.id, "what im looking for")
  // console.log(req.body, "req.req body")
  let shortURL = req.params.id;
  const user = /* old req.cookies["user_id"]*/req.session.user_id;
  const urlRecord = urlDatabase[shortURL];
  if (user === urlRecord.userID) {
    urlDatabase[shortURL].longURL = req.body.longURL;
  } else if (user !== urlRecord.userID) {
    res.status(401).send("S0rry hack3rz, no mischief for you");
  }
  //console.log(res,"long edit")
  res.redirect("/urls");
});
//sets cookie
app.post("/login", (req, res) => {
  const inputEmail = req.body.email;
  const inputPass = req.body.password;
  const user = getUserbyEmail(inputEmail, users);
  if (!user) {
    res.status(403).send("Sorry that email cannot be found, please try again");
  }
  const storedPass = (getUserby(inputEmail, users, "email", "password"));
  const goodPass = bcrypt.compareSync(inputPass, storedPass);
  console.log(goodPass);
  if (user && !goodPass) {
    res.status(403).send("Sorry, username and password combination is invalid, please try again");
  }
  console.log(user, "USER TEST");
  if (user && goodPass) {
    // old cookie
    //res.cookie("user_id", user.id);
    //new cookie
    req.session.user_id = user.id;
    res.redirect("/urls");
  }
  //If a user with that e-mail cannot be found, return a response with a 403 status code.
  ////If a user with that e-mail address is located, compare the password given in the form with the existing user's password. If it does not match, return a response with a 403 status code.
  //If both checks pass, set the user_id cookie with the matching user's random ID, then redirect to /urls.
  //console.log(user.id, "THIS");
  //res.cookie("user_id", user.id);

});
//logouts by clearing cookie
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

//handles registration form data
app.post('/register', (req, res) => {
  // console.log(req.body, "req.body");
  // console.log(req.params, "req.params");
  let newID = generateRandomString();
  //if email or pass is empty string
  const inputPassword = req.body.password;
  const inputEmail = req.body.email;
  const hashedPass = bcrypt.hashSync(inputPassword, 2);
  if (!inputEmail || !inputPassword) {
    res.status(400).send('no field can be left blank');
    //return;
  }
  let checkUser = getUserbyEmail(inputEmail, users);
  console.log(checkUser);
  if (checkUser) {
    res.status(400).send('User Already exists, please login instead');
    //return;
  } else {
    users[newID] = {
      id: newID,
      email: inputEmail,
      password: hashedPass
    };

    // old cookie res.cookie("user_id", newID);

    //new cookie
    req.session.user_id = newID;
    res.redirect("/urls");
  }
});

