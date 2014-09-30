var passport = require('passport')
  , user = require('./user')
  , config = geddy.config.passport
  , successRedirect = config.successRedirect
  , failureRedirect = config.failureRedirect
  , bcrypt = require('bcrypt');

var SUPPORTED_SERVICES = [];

SUPPORTED_SERVICES.forEach(function (item) {
  var hostname = geddy.config.fullHostname || ''
    , config = {
        callbackURL: hostname + '/auth/' +
            item + '/callback'
      }
    , Strategy = require('passport-' + item).Strategy
    , handler = function(token, tokenSecret, profile, done) {
        // Pass along auth data so auth'd users can make
        // API calls to the third-party service
        var authData = {
          token: token
        };
        if (tokenSecret) {
          authData.tokenSecret = tokenSecret;
        }
        profile.authData = authData;
        done(null, profile);
      };

  geddy.mixin(config, geddy.config.passport[item]);
  passport.use(new Strategy(config, handler));
});

var actions = new (function () {
  var self = this;

  var _createInit = function (authType) {
        return function (req, resp, params) {
          var self = this;
          req.session = this.session.data;
          passport.authenticate(authType)(req, resp);
        };
      }

    , _createCallback = function (authType) {
        return function (req, resp, params) {
          var self = this
            , handler = function (err, profile) {
                if (!profile) {
                  self.redirect(failureRedirect);
                }
                else {
                  user.lookupByPassport(authType, profile, function (err, user) {
                    var redirect = self.session.get('successRedirect');
                    if (err) {
                      throw err;
                    }
                    else {
                      // If there was a session var for an previous attempt
                      // to hit an auth-protected page, redirect there, and
                      // remove the session var so they don't keep going to
                      // that page for infinity
                      if (redirect) {
                        self.session.unset('successRedirect');
                      }
                      // Otherwise use the default redirect
                      else {
                        redirect = successRedirect;
                      }
                      // Local account's userId
                      self.session.set('userId', user.id);
                      // Third-party auth type, e.g. 'facebook'
                      self.session.set('authType', authType);
                      // Third-party auth tokens, may include 'token', 'tokenSecret'
                      self.session.set('authData', profile.authData);

                      self.redirect(redirect);
                    }
                  });
                }
              }
            , next = function (err) {
                if (err) {
                  throw err;
                }
              };
          req.session = this.session.data;
          passport.authenticate(authType, handler)(req, resp, next);
        };
      };

  this.local = function (req, resp, params) {
    var self = this
      , username = params.username
      , password = params.password
      , query = {username: {eql: username}, activatedAt: {ne: null}};

    geddy.model.User.first(query, {nocase: ['username']},
        function (err, user) {
      var crypted
        , redirect;
      if (err) {
        self.redirect(failureRedirect);
      }
      if (user) {
        if (bcrypt.compareSync(password + geddy.config.secret, user.password)) {
          redirect = self.session.get('successRedirect');

          // If there was a session var for an previous attempt
          // to hit an auth-protected page, redirect there, and
          // remove the session var so they don't keep going to
          // that page for infinity
          if (redirect) {
            self.session.unset('successRedirect');
          }
          // Otherwise use the default redirect
          else {
            redirect = successRedirect;
          }

          self.session.set('userId', user.id);
          self.session.set('authType', 'local');
          // No third-party auth tokens
          self.session.set('authData', {});

          self.redirect(redirect);
        }
        else {
          self.flash.error('Could not verify your login information.');
          self.redirect(failureRedirect);
        }
      }
      else {
        self.flash.error('Could not verify your login information.');
        self.redirect(failureRedirect);
      }
    });
  };

  SUPPORTED_SERVICES.forEach(function (item) {
    self[item] = _createInit(item);
    self[item + 'Callback'] = _createCallback(item);
  });

})();

module.exports = actions;
