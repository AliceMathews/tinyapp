const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const cookieParser = require('cookie-parser');
app.use(cookieParser());

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

function generateRandomString() { 
  let count = 0;
  let randomString = '';

  while (count < 6) { 
    let randomNumber = Math.floor(Math.random() * (122 - 48 +1) + 48);
    let randomChar = '';

    if (randomNumber >= 58 && randomNumber <= 64) {
      continue;
    } else if (randomNumber >= 91 && randomNumber <= 96) {
      continue;
    } else { 
      //convert to character 
      randomChar = String.fromCharCode(randomNumber);
      randomString += randomChar;
      count ++;
    }
  }

  return randomString;
}
  


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


app.get("/urls", (req, res) => {
  let templateVars = { 
    urls: urlDatabase,
    username: req.cookies["username"]
  };
  res.render('urls_index', templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = { 
    username: req.cookies["username"]
  };
  res.render('urls_new', templateVars);
});


//Register
app.get("/register", (req, res) => { 
  let templateVars = { 
    username: req.cookies["username"]
  };
  res.render('register', templateVars);
})

//login
app.post("/login", (req, res) => { 
  res.cookie("username", req.body.username);
  res.redirect("/urls");
})

//logout
app.post("/logout", (req, res) => { 
  res.clearCookie("username");
  res.redirect("/urls");
})

//stores new URL
app.post("/urls", (req, res) => {
  let longURL = req.body.longURL;

  //check if user included 'http://' and add if not
  if (!longURL.includes('http://')){ 
    longURL = "http://" + longURL;
  }

  let shortURL = '';
  if (!Object.values(urlDatabase).includes(longURL)){
    shortURL = generateRandomString();
    urlDatabase[shortURL] = longURL;
  } else { 
    shortURL = Object.keys(urlDatabase).find(key => urlDatabase[key] === longURL);
  }
  res.redirect(`/urls/${shortURL}`);
  
})

//deletes a url
app.post("/urls/:shortURL/delete", (req, res) => {
  
  delete urlDatabase[req.params.shortURL];

  res.redirect("/urls");
  
})

//edit a url
app.post("/urls/:shortURL", (req, res) => {
  const editedLongURL = req.body.longURL;
  const shortURL = req.params.shortURL;

  urlDatabase[shortURL] = editedLongURL;

  res.redirect("/urls")
  
})

app.get("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL];
  let templateVars = { 
    shortURL,
    longURL,
    username: req.cookies["username"]
  };
  res.render('urls_show', templateVars);
})

//redirect to longURL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  // if (!longURL === undefined) {
  //   res.redirect(longURL);
  // } else { 
    
  // }
  res.redirect(longURL);
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});