//app functions================================================
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
    array.push(lettersNumbers.charAt(randNumber()));
  }
  return array.join('');
};

///**helper function that retrieves user id bu email,///
const getUserbyEmail = (userEmail, database) => {
  for (let id in database) {
    //console.log(key,"key")
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
const urlsForUser = (id) => {
  let outputObject = {};
  for (let urlRecord in urlDatabase) {
    //console.log(key,"key")
    if (urlDatabase[urlRecord].userID === id) {
      outputObject[urlRecord] = urlDatabase[urlRecord];
    }
  }
  return outputObject;
};

module.exports = { generateRandomString, getUserbyEmail, getUserby, urlsForUser };