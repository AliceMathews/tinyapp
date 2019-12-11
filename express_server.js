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

function emailLookup(email) { 

  for (const user in users) { 
    if (email === users[user].email) { 
      return user;
    } 
  }
  return false;
} 
  


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 

};


app.get("/urls", (req, res) => {
  let templateVars = { 
    urls: urlDatabase,
    user: users[req.cookies["user_id"]]
  };
  console.log(users)
  res.render('urls_index', templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = { 
    user: users[req.cookies["user_id"]]
  };
  res.render('urls_new', templateVars);
});


//Register
app.get("/register", (req, res) => { 
  let templateVars = { 
    user: users[req.cookies["user_id"]]
  };
  res.render('register', templateVars);
})

app.post("/register", (req, res) => { 
  const email = req.body.email; 
  const password = req.body.password; 

  if (email === '' || password === '') {
    res.status(400).send({error: "Invalid email or password"});
  } else if (emailLookup(email)) {
    res.status(400).send({error: "User already exists"});
  } else { 
    const id = generateRandomString();
  
    users[id] = {};
    users[id].id = id; 
    users[id].email = email;
    users[id].password = password;
  
    res.cookie("user_id", id);
  
    res.redirect("/urls");
  }

})

//login
app.get("/login", (req,res) => { 
  let templateVars = { 
    user: users[req.cookies["user_id"]]
  };
  res.render('login', templateVars);
})

app.post("/login", (req, res) => { 
  const email = req.body.email; 
  const password = req.body.password;
  const user_id = emailLookup(email);
  console.log(user_id)

  if (!user_id) { 
    res.status(403).send({error: "Invalid email"});
  } else if (password !== users[user_id].password) { 
    res.status(403).send({error: `Invalid password for: ${users[user_id].email}`});
  } else { 
    res.cookie("user_id", user_id);
    res.redirect("/urls");
  }
})

//logout
app.post("/logout", (req, res) => { 
  res.clearCookie("user_id");
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
    user: users[req.cookies["user_id"]]
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