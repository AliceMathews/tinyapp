const { urlDatabase, users } = require('./database.js');

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

function urlsForUser(userID) { 
  const filteredURLDatabase = {};

  for (const shortURL in urlDatabase) { 
    if (urlDatabase[shortURL].userID === userID) { 
      filteredURLDatabase[shortURL] = urlDatabase[shortURL].longURL;
    }
  }

  return filteredURLDatabase;
}
  
function errorHandling(page, statusCode, error, req, res) { 
  res.status(statusCode) 
  let templateVars = { 
    user: users[req.session.user_id],
    error: error
  };
  res.render(page, templateVars);
}

module.exports = { generateRandomString, emailLookup, urlsForUser, errorHandling }