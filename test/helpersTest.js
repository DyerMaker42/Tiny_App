const {assert} = require('chai');

const { generateRandomString, getUserbyEmail, getUserby, urlsForUser } = require("../helpers")

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
    const user = getUserbyEmail("user@example.com", testUsers)
    const expectedOutput = "userRandomID";
    assert.deepEqual(user, testUsers[expectedOutput])
  });

  it('should return undefined if email does not exist', () => {
    const user = getUserbyEmail("bob@example.com", testUsers);
    assert.isUndefined(user)
  })
});

