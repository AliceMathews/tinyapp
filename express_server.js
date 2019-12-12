/* =========================================================================================================
 * SETUP
 * =========================================================================================================
 */

const { generateRandomString, getUserByEmail, urlsForUser, errorHandling } = require('./helpers.js');
const { urlDatabase, users } = require('./database.js');

const express = require('express');
const app = express();
const PORT = 8080; // default port 8080

const bcrypt = require('bcrypt');

const methodOverride = require('method-override');
app.use(methodOverride('_method'));

const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ['lighthouse', 'labs'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));

app.set('view engine', 'ejs');



/* =========================================================================================================
 * ROUTES
 * =========================================================================================================
 */

/* Homepage
 * --------------------------------------------------------------------------------------------------------*/
app.get('/', (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

app.get('/urls', (req, res) => {
  let templateVars = {
    urls: urlsForUser(req.session.user_id, urlDatabase),
    user: users[req.session.user_id]
  };
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  if (req.session.user_id) {
    let templateVars = {
      user: users[req.session.user_id]
    };
    res.render('urls_new', templateVars);
  } else {
    res.redirect('/login');
  }
  
});

/* Register
 * --------------------------------------------------------------------------------------------------------*/
app.get('/register', (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
  } else {
    let templateVars = {
      user: users[req.session.user_id],
      error: null
    };
    res.render('register', templateVars);
  }
});

app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = bcrypt.hashSync(req.body.password, 10);
  
  if (email === '' || req.body.password === '') {
    errorHandling('register', users, 400, 'Invalid email or password', req, res);

  } else if (getUserByEmail(email, users)) {
    errorHandling('register', users, 400, 'User already exists', req, res);

  } else {
    const id = generateRandomString();
  
    users[id] = {
      id,
      email,
      password
    };
  
    req.session.user_id = id;
  
    res.redirect('/urls');
  }

});

/* Login
 * --------------------------------------------------------------------------------------------------------*/
app.get('/login', (req,res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
  } else {
    let templateVars = {
      user: users[req.session.user_id],
      error: null
    };
    res.render('login', templateVars);
  }
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user_id = getUserByEmail(email, users);

  if (!user_id) {
    errorHandling('login', users, 403, `User: ${email} does not exist`, req, res);
  
  } else if (!bcrypt.compareSync(password, users[user_id].password)) {
    errorHandling('login', users, 403, `Invalid password for: ${users[user_id].email}`, req, res);

  } else {
    req.session.user_id = user_id;
    res.redirect('/urls');
  }
});

/* Logout
 * --------------------------------------------------------------------------------------------------------*/
app.post('/logout', (req, res) => {
  delete req.session.user_id;
  res.redirect('/urls');
});

/* Store new URL
 * --------------------------------------------------------------------------------------------------------*/
app.post('/urls', (req, res) => {
  
  if (req.session.user_id) {
    let longURL = req.body.longURL;

    //check if user included 'http://' and add if not
    if (!longURL.includes('http://')) {
      longURL = 'http://' + longURL;
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

  } else {
    res.redirect('/login');
  }
});

/* Delete URL
 * --------------------------------------------------------------------------------------------------------*/
app.delete('/urls/:shortURL', (req, res) => {
  const urlToDelete = req.params.shortURL;

  if (req.session.user_id && urlDatabase[urlToDelete].userID === req.session.user_id) {
    delete urlDatabase[urlToDelete];
    res.redirect('/urls');
  } else if (!req.session.user_id) {
    res.redirect('/login');
  } else if (urlDatabase[req.params.shortURL].userID !== req.session.user_id) {
    let templateVars = {
      user: users[req.session.user_id],
      error: 'Not authorised to view this page'};
    res.render('error', templateVars);
  }
});

/* Edit URL
 * --------------------------------------------------------------------------------------------------------*/
app.put('/urls/:shortURL', (req, res) => {
  const editedLongURL = req.body.longURL;
  const shortURL = req.params.shortURL;
  if (req.session.user_id && urlDatabase[shortURL].userID === req.session.user_id) {
    urlDatabase[shortURL].longURL = editedLongURL;
    res.redirect('/urls');
  } else if (!req.session.user_id) {
    res.redirect('/login');
  } else if (urlDatabase[shortURL].userID !== req.session.user_id) {
    let templateVars = {
      user: users[req.session.user_id],
      error: 'Not authorised to view page'};
    res.render('error', templateVars);
  }
});

/* Show URL
 * --------------------------------------------------------------------------------------------------------*/
app.get('/urls/:shortURL', (req, res) => {
  let shortURL = req.params.shortURL;
  
  
  if (urlDatabase[shortURL] === undefined) {
    let templateVars = {
      user: users[req.session.user_id],
      error: 'URL does not exist'
    };
    res.render('error', templateVars);
  } else {
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
  }
});

/* Redirect to longURL
 * --------------------------------------------------------------------------------------------------------*/
app.get('/u/:shortURL', (req, res) => {
  if (urlDatabase[req.params.shortURL] === undefined) {
    let templateVars = {
      user: users[req.session.user_id],
      error: 'URL does not exist'
    };
    res.render('error', templateVars);
  } else {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect(longURL);
  }
});





app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});