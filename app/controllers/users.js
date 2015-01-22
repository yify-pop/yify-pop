var passport = require('../helpers/passport')
  , generateHash = passport.generateHash
  , requireAuth = passport.requireAuth;


var Users = function () {
  this.before(requireAuth, {
    except: ['add', 'create', 'activate']
  });

  this.respondsWith = ['html', 'json', 'xml', 'js', 'txt'];

  this.index = function (req, resp, params) {
    var self = this;

    geddy.model.User.all(function(err, users) {
      self.respond({params: params, users: users});
    });
  };

  this.add = function (req, resp, params) {
    this.respond({params: params});
  };

  this.create = function (req, resp, params) {
    var self = this
      , user = geddy.model.User.create(params)
      , sha;

    // Non-blocking uniqueness checks are hard
    geddy.model.User.first({username: user.username}, function(err, data) {
      var activationUrl;
      if (err) {
        throw err;
      }
      if (data) {
        user.errors  = {
          username: 'This username is already in use.'
        };
        self.respondWith(user);
      }
      else {
        if (user.isValid()) {
          user.password = generateHash(user.password);
          user.activatedAt = new Date();
          user.save(function(err, data) {
            if (err) {
              throw err;
            }

            else {
              self.respondWith(user);
            }
          });
        }
        else {
          self.respondWith(user, {status: err});
        }
      }
    });

  };

  this.show = function (req, resp, params) {
    var self = this;

    geddy.model.User.first(params.id, function(err, user) {
      if (err) {
        throw err;
      }
      if (!user) {
        throw new geddy.errors.NotFoundError();
      }
      else {
        user.password = '';
        self.respondWith(user);
      }
    });
  };

  this.edit = function (req, resp, params) {
    var self = this;

    geddy.model.User.first(params.id, function(err, user) {
      if (err) {
        throw err;
      }
      if (!user) {
        throw new geddy.errors.BadRequestError();
      }
      else {
        self.respondWith(user);
      }
    });
  };

  this.update = function (req, resp, params) {
    var self = this;

    geddy.model.User.first(params.id, function(err, user) {
      // Only update password if it's changed
      var skip = params.password ? [] : ['password'];

      user.updateAttributes(params, {skip: skip});

      if (!user.isValid()) {
        self.respondWith(user);
      }
      else {
        if (params.password) {
          user.password = generateHash(user.password);
        }

        user.save(function(err, data) {
          if (err) {
            throw err;
          }
          self.respondWith(user, {status: err});
        });
      }
    });
  };

  this.remove = function (req, resp, params) {
    var self = this;

    geddy.model.User.first(params.id, function(err, user) {
      if (err) {
        throw err;
      }
      if (!user) {
        throw new geddy.errors.BadRequestError();
      }
      else {
        geddy.model.User.remove(params.id, function(err) {
          if (err) {
            throw err;
          }
          self.respondWith(user);
        });
      }
    });
  };

};

exports.Users = Users;
