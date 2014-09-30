var passport = require('../helpers/passport');

var Auth = function () {
  geddy.mixin(this, passport.actions);
};

exports.Auth = Auth;
