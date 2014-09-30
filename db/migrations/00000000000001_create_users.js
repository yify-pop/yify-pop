var CreateUsers = function () {
  this.up = function (next) {
    var def = function (t) {
          t.column('username', 'string');
          t.column('password', 'string');
          t.column('familyName', 'string');
          t.column('givenName', 'string');
          t.column('email', 'string');
          t.column('activationToken', 'string');
          t.column('activatedAt', 'datetime');
        }
      , callback = function (err, data) {
          if (err) {
            throw err;
          }
          else {
            next();
          }
        };
    this.createTable('users', def, callback);
  };

  this.down = function (next) {
    var callback = function (err, data) {
          if (err) {
            throw err;
          }
          else {
            next();
          }
        };
    this.dropTable('users', callback);
  };
};

exports.CreateUsers = CreateUsers;
