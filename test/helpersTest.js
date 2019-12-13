const { assert } = require('chai');

const { getUserByEmail, uniqueVisitCount } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedOutput = "userRandomID";
    assert.equal(user, expectedOutput);
  });

  it('should return false if the user doesnt exist', function() {
    const user = getUserByEmail("user5@example.com", testUsers)
    const expectedOutput = false;
    assert.equal(user, expectedOutput);
  });
});


const testVisits = [ 
  { visitorID: 'aJ48lW', time: '2:00' },
  { visitorID: 'hP9hfG', time: '2:00' },
  { visitorID: 'aJ48lW', time: '2:00' },
  { visitorID: 'fd7Bqg', time: '2:00' },
  { visitorID: 'aJ48lW', time: '2:00' },
  { visitorID: '6yJ3hG', time: '2:00' },
];

describe('count unique visits', function() {
  it('should return the number of unique visits', function() {
    const uniqueVisits = uniqueVisitCount(testVisits)
    const expectedOutput = 4;
    assert.equal(uniqueVisits, expectedOutput);
  });

  
});