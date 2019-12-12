const bcrypt = require('bcrypt');


const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca",
              userID: "aJ48lW" },
  "9sm5xK": { longURL: "http://www.google.com",
              userID: "aJ48lW" }
};

const users = { 
  aJ48lW: { id: "aJ48lW",
            email: "alice_mathews@hotmail.co.uk", 
            password: bcrypt.hashSync("banana", 10) }
};

module.exports = { urlDatabase, users }