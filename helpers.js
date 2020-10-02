//app functions================================================

//generates 6 digit string (ie Uoh87x)
const generateRandomString = () => {
  // give set of characters to choose
  const lettersNumbers = "QWERTYUIOPASDFGHJKLZXCVBNMqwertyuiopasdfghjklzxcvbnm1234567890";
  let randNumber = () => {
    return Math.floor(Math.random() * 63);
  };
  let array = [];
  for (let i = 0; i < 6; i++) {
    array.push(lettersNumbers.charAt(randNumber()));
  }
  return array.join('');
};

//helper function that retrieves user object by email
const getUserbyEmail = (userEmail, database) => {
  for (let id in database) {
    if (database[id].email === userEmail) {
      return database[id];
    }
  }

};
//helperfunction that outputs values based in which input and desired output
const getUserby = (inputValue, database, inputParameter, desiredOutput) => {
  for (let key in database) {
    //console.log(key,"key")
    if (database[key][inputParameter] === inputValue) {
      return database[key][desiredOutput];
    }
  }
};

/*id is user_id, returns entire URL record, longURL and userID are keys of returned object.*/
const urlsForUser = (id, db) => {
  let outputObject = {};
  for (let urlRecord in db) {
    //console.log(key,"key")
    if (db[urlRecord].userID === id) {
      outputObject[urlRecord] = db[urlRecord];
    }
  }
  return outputObject;
};

module.exports = { generateRandomString, getUserbyEmail, getUserby, urlsForUser };