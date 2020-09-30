const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");


app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
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
    array.push(lettersNumbers.charAt(randNumber()))
  }
  return array.join('');
}

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
  let username = req.cookies ? req.cookies["username"] : null;
  console.log(username, "username")
  console.log(req.cookies, "req.cookies")
  const templateVars = { urls: urlDatabase, username: username };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let username = req.cookies ? req.cookies["username"] : null;

  const templateVars = { username: username };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let username = req.cookies ? req.cookies["username"] : null;
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    username
  }
  res.render("urls_show", templateVars)
});

//redirects to long URL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL)
});

//POST Routes
//adds new URL to db

app.post("/urls", (req, res) => {
  let newURL = generateRandomString();
  console.log(req.body.longURL)
  urlDatabase[newURL] = req.body.longURL;
  res.redirect(`/urls/${newURL}`);
});

//actually deletes a URL
app.post("/urls/:shortURL/delete", (req, res) => {
  //console.log(req.params.shortURL)
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls")
})

//edits a URL
app.post("/urls/:id", (req, res) => {
  // console.log(req.params.id, "what im looking for")
  // console.log(req.body, "req.req body")
  urlDatabase[req.params.id] = req.body.longURL
  //console.log(res,"long edit")
  res.redirect("/urls")
})
//sets cookie
app.post("/login", (req, res) => {
  console.log(req.body)
  res.cookie("username", req.body.username)
  res.redirect("/urls")
})
//logouts by clearing cookie
app.post("/logout", (req, res) => {
  res.clearCookie("username")
  res.redirect("/urls")
})

//registers a user
app.get("/register", (req,res) => {
  let username = req.cookies ? req.cookies["username"] : null;

  const templateVars = { username: username };
  res.render("registration", templateVars)
});