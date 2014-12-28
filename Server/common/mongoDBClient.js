var mongoose = require('mongoose');

module.exports = function(url){
   return mongoose.connect(url);
};
