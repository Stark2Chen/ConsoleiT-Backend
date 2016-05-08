var mongoose = require('mongoose');

var UserSchema = mongoose.Schema({
  _id: Number,
  email: String,
  passwd: String,
  realname: String,
  resetToken: String,
  isRoot: Boolean,

  /* Personal info */

  /**
   * Possible value for gender:
   * - male
   * - female
   * - unknown
   * Or other custom value
   */ 
  gender: {
    type: String,
    default: "unknown"
  },
  phone: String,
  desc: String,

  /**
   * Type of identification document 
   * (this is considering about users who don't have a Chinese National ID):
   * 1: National ID
   * 2: Passport
   * 3: Home Return Permit (HK/Macao) or Taiwan compatriot permit
   */
  IDType: Number,
  IDNumber: String,

  /**
   * Type of school:
   * 1: Junior high (Secondary school, middle school)
   * 2: High school (Senior high)
   * 3: University
   * 4: others (does not calculate grade)
   */
  schoolType: Number,
  schoolName: String,
  yearEnrolled: Number, //Grade is calculated

  experiences: {
    type: [{
      /**
       * Name of the conference
       */
      conf: String, 

      /**
       * Is automatically generated by Console iT
       */
      generated: Boolean,

      /**
       * Level of the conference.
       * Possible values:
       * 1: International
       * 2: National
       * 3: Provincial
       * 4: Municipal (city)
       * 5: Discrict/County
       * 6: Interscholar
       * 7: Internal (school)
       */
      level: {
        type: Number, 
        enum: [1,2,3,4,5,6,7],
      },

      /**
       * String repersentation of awards won in that specific conference
       */
      awards: String,
    }],
    default: []
  }
});

UserSchema.methods.validatePasswd = function(passwd) {
  if(!passwd) return false;
  else {
    const hash = crypto.createHmac('sha256', config.auth.secret).update(passwd + this.email).digest('hex');
    return hash == this.passwd;
  }
}

UserSchema.methods.setPasswd = function(passwd) {
  const hash = crypto.createHmac('sha256', config.auth.secret).update(passwd + this.email).digest('hex');
  this.passwd = hash;
}

UserSchema.methods.initPasswd = function() {
  var token = crypto.randomBytes(16).toString('hex');
  this.setPasswd(token);
  return token;
}

UserSchema.methods.generateToken = function() {
  var token = crypto.randomBytes(48).toString('hex');
  this.resetToken = token;
  return token;
}

UserSchema.methods.validateToken = function(token) {
  if(this.resetToken && this.resetToken == token) {
    this.resetToken = undefined;
    return true;
  } else return false;
}

UserSchema.options.toObject = {
  versionKey: false,
  transform: (doc, ret, options) => {
    delete ret.passwd;
  }
}

module.exports = UserSchema;
