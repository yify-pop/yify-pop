var CreatePassports = function () {
  this.up = function (next) {
    var def = function (t) {
          var datatype = geddy.model.autoIncrementId ? 'int' : 'string';
          t.column('authType', 'string');
          t.column('key', 'string');
          t.column('userId', datatype); // belongsTo User
        }
      , callback = function (err, data) {
          if (err) {
            throw err;
          }
          else {
            next();
          }
        };
    this.createTable('passports', def, callback);
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
    this.dropTable('passports', callback);
  };
};

exports.CreatePassports = CreatePassports;
