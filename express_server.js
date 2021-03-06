const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");

const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');

const { generateRandomString, getUserbyEmail, getUserby, urlsForUser } = require("./helpers");

//app middleware---------------------------------------
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieSession({
  user_ID: 'session',
  keys: ['scaryKeyScary'],
  maxAge: 5 * 60 * 1000
}));


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
  const user_id = req.session.user_id;
  if (user_id) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//renders url page
app.get("/urls", (req, res) => {
  const user_id = req.session.user_id;
  const user = users[user_id];

  if (!user_id) {
    res.redirect("/login");
  }

  let userURLs = urlsForUser(user_id, urlDatabase);

  const templateVars = { urls: userURLs, user };

  res.render("urls_index", templateVars);
});

//renders page
app.get("/urls/new", (req, res) => {
  let user_id = req.session.user_id;
  const user = users[user_id];
  const templateVars = { user, users };

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

  //checking if user should have access to page, if not error
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
  //if not logged in value will be falsy
  let cookie = req.session.user_id;

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
  const shortURL = req.params.shortURL;
  const user = req.session.user_id;
  const urlRecord = urlDatabase[shortURL];

  if (user === urlRecord.userID) {
    delete urlDatabase[shortURL];
  }
  res.redirect("/urls");
});

//edits a URL
app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const user = req.session.user_id;
  const urlRecord = urlDatabase[shortURL];
  //checks if cookie matches user id assosciated with the url
  if (user === urlRecord.userID) {
    urlDatabase[shortURL].longURL = req.body.longURL;
  } else if (user !== urlRecord.userID) {
    res.status(401).send("S0rry hack3rz, no mischief for you");
  }

  res.redirect("/urls");
});

//sets cookie and logs in
app.post("/login", (req, res) => {
  const inputEmail = req.body.email;
  const inputPass = req.body.password;
  const user = getUserbyEmail(inputEmail, users);
  if (!user) {
    res.status(403).send("Sorry that email cannot be found, please try again");
  }
  
  const storedPass = (getUserby(inputEmail, users, "email", "password"));
  //boolean value
  const goodPass = bcrypt.compareSync(inputPass, storedPass);
  console.log(goodPass);
  if (user && !goodPass) {
    res.status(403).send("Sorry, username and password combination is invalid, please try again");
  }
  
  if (user && goodPass) {
    req.session.user_id = user.id;
    res.redirect("/urls");
  }
});

//logouts by clearing cookie
app.post("/logout", (req, res) => {
  req.session.user_id = null;
  res.redirect("/urls");
});

//handles registration form data
app.post('/register', (req, res) => {
  let newID = generateRandomString();

  //if email or pass is empty string
  const inputPassword = req.body.password;
  const inputEmail = req.body.email;
  const hashedPass = bcrypt.hashSync(inputPassword, 2);
  if (!inputEmail || !inputPassword) {
    res.status(400).send('no field can be left blank');
  }

  let checkUser = getUserbyEmail(inputEmail, users);
  
  if (checkUser) {
    res.status(400).send('User Already exists, please login instead');
  } else {
    users[newID] = {
      id: newID,
      email: inputEmail,
      password: hashedPass
    };
    req.session.user_id = newID;
    res.redirect("/urls");
  }
});

