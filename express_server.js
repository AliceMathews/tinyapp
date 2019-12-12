const { generateRandomString, emailLookup, urlsForUser, errorHandling } = require('./helpers.js');
const { urlDatabase, users } = require('./database.js');

const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const bcrypt = require('bcrypt');

const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ['lighthouse', 'labs'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

// function generateRandomString() { 
//   let count = 0;
//   let randomString = '';

//   while (count < 6) { 
//     let randomNumber = Math.floor(Math.random() * (122 - 48 +1) + 48);
//     let randomChar = '';

//     if (randomNumber >= 58 && randomNumber <= 64) {
//       continue;
//     } else if (randomNumber >= 91 && randomNumber <= 96) {
//       continue;
//     } else { 
//       //convert to character 
//       randomChar = String.fromCharCode(randomNumber);
//       randomString += randomChar;
//       count ++;
//     }
//   }

//   return randomString;
// }

// function emailLookup(email) { 

//   for (const user in users) { 
//     if (email === users[user].email) { 
//       return user;
//     } 
//   }
//   return false;
// } 

// function urlsForUser(userID) { 
//   const filteredURLDatabase = {};

//   for (const shortURL in urlDatabase) { 
//     if (urlDatabase[shortURL].userID === userID) { 
//       filteredURLDatabase[shortURL] = urlDatabase[shortURL].longURL;
//     }
//   }

//   return filteredURLDatabase;
// }
  
// function errorHandling(page, statusCode, error, req, res) { 
//   res.status(statusCode) 
//   let templateVars = { 
//     user: users[req.session.user_id],
//     error: error
//   };
//   res.render(page, templateVars);
// }


// const urlDatabase = {
//   "b2xVn2": { longURL: "http://www.lighthouselabs.ca",
//               userID: "aJ48lW" },
//   "9sm5xK": { longURL: "http://www.google.com",
//               userID: "aJ48lW" }
// };

// const users = { 
//   aJ48lW: { id: "aJ48lW",
//             email: "alice_mathews@hotmail.co.uk", 
//             password: bcrypt.hashSync("banana", 10) }
// };


app.get("/urls", (req, res) => {
  let templateVars = { 
    urls: urlsForUser(req.session.user_id),
    user: users[req.session.user_id]
  };
  res.render('urls_index', templateVars);
});

app.get("/urls/new", (req, res) => {
  if(req.session.user_id) { 
    let templateVars = { 
      user: users[req.session.user_id]
    };
    res.render('urls_new', templateVars);
  } else {
    res.redirect("/login");
  }
  
});


//Register
app.get("/register", (req, res) => { 
  let templateVars = { 
    user: users[req.session.user_id],
    error: null
  };
  res.render('register', templateVars);
})

app.post("/register", (req, res) => { 
  const email = req.body.email; 
  const password = bcrypt.hashSync(req.body.password, 10);
  
  if (email === '' || req.body.password === '') {
    errorHandling('register', 400, "Invalid email or password", req, res);

  } else if (emailLookup(email)) {
    errorHandling('register', 400, "User already exists", req, res);

  } else { 
    const id = generateRandomString();
  
    users[id] = {
      id, 
      email, 
      password
    };
  
    req.session.user_id = id;
  
    res.redirect("/urls");
  }

})

//login
app.get("/login", (req,res) => { 
  let templateVars = { 
    user: users[req.session.user_id],
    error: null
  };
  res.render('login', templateVars);
})

app.post("/login", (req, res) => { 
  const email = req.body.email; 
  const password = req.body.password;
  const user_id = emailLookup(email);

  if (!user_id) { 
    errorHandling('login', 403, `User: ${email} does not exist`, req, res);
  
  } else if (!bcrypt.compareSync(password, users[user_id].password)) { 
    errorHandling('login', 403, `Invalid password for: ${users[user_id].email}`, req, res);

  } else { 
    req.session.user_id = user_id;
    res.redirect("/urls");
  }
})

//logout
app.post("/logout", (req, res) => { 
  delete req.session.user_id;
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
  // if (!Object.values(urlDatabase).includes(longURL)){
  //   shortURL = generateRandomString();
  //   urlDatabase[shortURL].longURL = longURL;
  // } else { 
  //   shortURL = Object.keys(urlDatabase).find(key => urlDatabase[key] === longURL);
  // }
  
  const userID = req.session.user_id;
  shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL,
    userID
  };

  res.redirect(`/urls/${shortURL}`);
})

//deletes a url
app.post("/urls/:shortURL/delete", (req, res) => {
  const urlToDelete = req.params.shortURL;

  if(req.session.user_id && urlDatabase[urlToDelete].userID === req.session.user_id) {
    delete urlDatabase[urlToDelete];
  }

  res.redirect("/urls");
})

//edit a url
app.post("/urls/:shortURL", (req, res) => {
  const editedLongURL = req.body.longURL;
  const shortURL = req.params.shortURL;

  if(req.session.user_id && urlDatabase[shortURL].userID === req.session.user_id) {
    urlDatabase[shortURL].longURL = editedLongURL;
  }

  res.redirect("/urls")
  
})

app.get("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL].longURL;
  let userID = urlDatabase[shortURL].userID;
  
  let templateVars = { 
    URL: {
      shortURL,
      longURL,
      userID
    },
    user: users[req.session.user_id]
  };
  
  res.render('urls_show', templateVars);
})

//redirect to longURL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});