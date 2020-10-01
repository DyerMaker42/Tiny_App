const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

//app middleware---------------------------------------
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

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
  "aJ48lW": {
    id: "aJ48lW",
    email: "kenny@pulitzer.net",
    password: "be-humble"
  },
  "h3h3h3": {
    id: "h3h3h3",
    email: "eastbound@down.net",
    password: "kennyPowers"
  }
};

//app functions================================================
//generates 6 digit string (ie Uoh87x)
const generateRandomString = () => {
  // give set of characters to choose
  const lettersNumbers = "QWERTYUIOPASDFGHJKLZXCVBNMqwertyuiopasdfghjklzxcvbnm1234567890";
  //generate random number
  let randNumber = () => {
    return Math.floor(Math.random() * 63);
  };
  //loop through six digits
  let array = [];
  for (let i = 0; i < 6; i++) {
    array.push(lettersNumbers.charAt(randNumber()));
  }
  return array.join('');
};

///**helper function that retrieves user id bu email,///
function getUserbyEmail(userEmail, users) {
  for (let id in users) {
    //console.log(key,"key")
    if (users[id].email === userEmail) {
      return users[id];
    }
  }

}
//helperfunction that outputs values based in which input and desired output
function getUserby(inputValue, users, inputParameter, desiredOutput) {
  for (let key in users) {
    //console.log(key,"key")
    if (users[key][inputParameter] === inputValue) {
      return users[key][desiredOutput];
    }

  }

}
/*id is user_id, returns entire URL record, longURL and userID are keys of returned object.*/
function urlsForUser(id) {
  let outputObject = {};
  for (let urlRecord in urlDatabase) {
    //console.log(key,"key")
    if (urlDatabase[urlRecord].userID === id) {
       outputObject[urlRecord] = urlDatabase[urlRecord];
    }
  }
  return outputObject;
}

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
  const user_id = req.cookies["user_id"];
  const user = users[user_id];
  if (!user_id) {
    res.redirect("/login")
  }
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
  let user_id = req.cookies["user_id"];
  const user = users[user_id];
  const templateVars = {
    user,
    users
  };
  if (!req.cookies["user_id"]) {
    res.redirect("/login")
  } else {
    res.render("urls_new", templateVars);
  }
});
//edit individual URLS page
app.get("/urls/:shortURL", (req, res) => {
  const user_id = req.cookies["user_id"];
  if (!user_id) {
    res.redirect("/login")
  }
  
  const user = users[user_id];
  const shortURL = req.params.shortURL;
  const urlRecord = urlDatabase[shortURL];
  //let userURLs = urlsForUser(user_id);
//checking if user should have access to page
  if(urlRecord.userID !== user_id){
    res.status(401).send("You do not have access to this URL, please login with appropriate credentials and try again")
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
  let user_id = req.cookies["user_id"];
  const user = users[user_id];

  const templateVars = { user, users };
  res.render("registration", templateVars);
});
//renders login page
app.get("/login", (req, res) => {
  let user_id = req.cookies["user_id"];
  const user = users[user_id];
  const templateVars = { user, users };
  if (req.cookies["user_id"]) {
    res.redirect("/urls")
  }
  res.render("login", templateVars);
});
//===========================================================
//POST Routes
//adds new URL to db

app.post("/urls", (req, res) => {
  let newURL = generateRandomString();
  console.log(req.body.longURL);
  urlDatabase[newURL] = {
    longURL: req.body.longURL,
    userID: req.cookies["user_id"]
  }
  if (!req.cookies["user_id"]) {
    res.redirect("/login")
  }
  res.redirect(`/urls/${newURL}`);
});

//actually deletes a URL
app.post("/urls/:shortURL/delete", (req, res) => {
  //console.log(req.params.shortURL)
  if (req.cookies["user_id"]) {
    delete urlDatabase[req.params.shortURL];
  }
  res.redirect("/urls");
});

//edits a URL
app.post("/urls/:id", (req, res) => {
  // console.log(req.params.id, "what im looking for")
  // console.log(req.body, "req.req body")
  let id = req.params.id
  urlDatabase[id].longURL = req.body.longURL;
  //console.log(res,"long edit")
  res.redirect("/urls");
});
//sets cookie
app.post("/login", (req, res) => {
  console.log(req.body);
  const user = getUserbyEmail(req.body.email, users);
  const goodPass = getUserby(req.body.email, users, "email", "password") === req.body.password;
  if (!user) {
    res.status(403).send("Sorry that email cannot be found, please try again");
  }
  if (user && (getUserby(req.body.email, users, "email", "password") !== req.body.password)) {
    res.status(403).send("Sorry, username and password combination is invalid, please try again");
  }
  console.log(user, "USER TEST");
  if (user && goodPass) {
    res.cookie("user_id", user.id);
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
  res.clearCookie("user_id");
  res.redirect("/urls");
});

//handles registration form data
app.post('/register', (req, res) => {
  // console.log(req.body, "req.body");
  // console.log(req.params, "req.params");
  let newID = generateRandomString();
  //if email or pass is empty string

  if (!req.body.email || !req.body.password) {
    res.status(400).send('no field can be left blank');
    //return;
  }
  let checkUser = getUserbyEmail(req.body.email, users);
  console.log(checkUser);
  if (checkUser) {
    res.status(400).send('User Already exists, please login instead');
    //return;
  } else {
    users[newID] = {
      id: newID,
      email: req.body.email,
      password: req.body.password
    };

    res.cookie("user_id", newID);
    res.redirect("/urls");
  }
});

console.log(urlsForUser("aJ48lW"))