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
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
  "kungFooKenny": {
    id: "kungFooKenny",
    email: "kenny@pulitzer.net",
    password: "be-humble"
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

//helper function that retrieves user id bu email, 
function getUserbyEmail(userEmail, users) {
  for (let id in users) {
    //console.log(key,"key")
    if (users[id].email === userEmail) {
      return users[id]
    }
  }

};
//helperfunction that outputs values based in which input and desired output
function getUserby(inputValue, users, inputParameter, desiredOutput) {
  for (let key in users) {
    //console.log(key,"key")
    if (users[key][inputParameter] === inputValue) {
      return users[key][desiredOutput]
    }

  }

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

app.get("/urls", (req, res) => {
  const user_id = req.cookies["user_id"];
  const user = users[user_id]
  // console.log(username, "user_id");
  // console.log(req.cookies, "req.cookies");
  console.log(user)
  const templateVars = { urls: urlDatabase, user, };
  console.log(user_id);
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let user_id = req.cookies["user_id"];
  const user = users[user_id];
  const templateVars = {
    user,
    users
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const user_id = req.cookies["user_id"];
  const user = users[user_id];
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user,
    users
  };
  res.render("urls_show", templateVars);
});

//redirects to long URL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//renders registration page
app.get("/register", (req, res) => {
  let user_id = req.cookies["user_id"];
  const user = users[user_id];

  const templateVars = { user, users };
  res.render("registration", templateVars);
});

//POST Routes
//adds new URL to db

app.post("/urls", (req, res) => {
  let newURL = generateRandomString();
  console.log(req.body.longURL);
  urlDatabase[newURL] = req.body.longURL;
  res.redirect(`/urls/${newURL}`);
});

//actually deletes a URL
app.post("/urls/:shortURL/delete", (req, res) => {
  //console.log(req.params.shortURL)
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

//edits a URL
app.post("/urls/:id", (req, res) => {
  // console.log(req.params.id, "what im looking for")
  // console.log(req.body, "req.req body")
  urlDatabase[req.params.id] = req.body.longURL;
  //console.log(res,"long edit")
  res.redirect("/urls");
});
//sets cookie
app.post("/login", (req, res) => {
  const user = getUserbyEmail(req.body.userEmail, users);
  console.log(user.id, "THIS");
  res.cookie("user_id", user.id);
  res.redirect("/urls");
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
  let checkUser = getUserbyEmail(req.body.email, users)
  console.log(checkUser)
  if (checkUser) {
    res.status(400).send('User Already exists, please login instead')
    //return;
  } else {
    users[newID] = {
      id: newID,
      email: req.body.email,
      password: req.body.password
    }

    res.cookie("user_id", newID)
    res.redirect("/urls")
  }
});