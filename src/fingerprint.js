var crypto = require('crypto');

// var pubre = /^(ssh-[dr]s[as]\s+)|(\s+.+)|\n/g;
// todo - convert the public key to a id_rsa.pub style key before signing.

module.exports = fingerprint;

function fingerprint (pub) {
  var key = hash(pub, 'sha1');
  return colons(key);
}

// hash a string with the given alg
function hash (s, alg) {
  return crypto.createHash(alg).update(s).digest('hex');
}

// add colons, 'hello' => 'he:ll:o'
function colons (s) {
  return s.replace(/(.{2})(?=.)/g, '$1:');
}
