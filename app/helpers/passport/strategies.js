
module.exports = {
  twitter: {
    name: 'Twitter'
  , keyField: 'id'
  , parseProfile: function (profile) {
      var userData = {}
        , displayName = profile.displayName
        , names;
      // Try to parse out given and family names
      if (displayName) {
        names = displayName.split(/\s/);
        userData.givenName = names.shift();
        if (names.length) {
          userData.familyName = names.pop();
        }
      }
      else {
        userData.givenName = profile.username;
      }
      return userData;
    }
  }
, facebook: {
    name: 'Facebook'
  , keyField: 'id'
  , parseProfile: function (profile) {
      var userData = {
        givenName: profile.name.givenName || profile.username
      , familyName: profile.name.familyName
      };
      return userData;
    }
  }
, yammer: {
    name: 'Yammer'
  , keyField: 'id'
  , parseProfile: function (profile) {
      var userData = {
        givenName: profile._json.first_name || profile.name
      , familyName: profile._json.last_name
      };
      return userData;
    }
  }
};

