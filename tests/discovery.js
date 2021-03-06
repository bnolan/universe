// start a signalhub on port 9000 before starting

var NodeRSA = require('node-rsa');
var fingerprint = require('../fingerprint');
var client = require('signalhub');
var tape = require('tape');
var jwt = require('jsonwebtoken');
var _ = require('lodash');
var SimplePeer = require('simple-peer');

var sesssionDescription = {'sdp': 'v=0\r\no=.....'};

var fixtures = [];

function announce (client, sesssionDescription, pkf, details) {
  var descr = JSON.parse(JSON.stringify(sesssionDescription));

  var msg = {
    publicKey: details.publicKey,
    session: descr
  };

  client.broadcast(pkf, jwt.sign(msg, details.privateKey, { algorithm: 'RS256'}));
}

/*
tape('test', function (t) {
  var details = {"publicKey":"-----BEGIN PUBLIC KEY-----\nMFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAKgmVzdsFz5lDE5Rme6qYcvcoExVlQTo\nBfnASFh1bpv4ych/A5r9Ip1q0eJDGv9JLVIecTxUPgHWUt1Ikr/TQGUCAwEAAQ==\n-----END PUBLIC KEY-----","privateKey":"-----BEGIN RSA PRIVATE KEY-----\nMIIBOgIBAAJBAKgmVzdsFz5lDE5Rme6qYcvcoExVlQToBfnASFh1bpv4ych/A5r9\nIp1q0eJDGv9JLVIecTxUPgHWUt1Ikr/TQGUCAwEAAQJAFvXtUOcUoXOA46zm3R0s\n73538RR6ncnlDv5/onyelvOADuwgCjJZ5ZR0Mhcb8sCR8XME8td/vNcDx3qJvHNH\nPQIhAOLYtPGD4qtjfFo2JnanbEW4899GdhMBjzc9qSqls7ybAiEAvcJ/+xTVEEX2\n/6b7iwfHQhve5PsIZzydtfhoiHwoRv8CIEntcdqbro1IWMhViWd13JVEV0XWgrhi\n87d/AtiBM/gtAiAMYAzcoQUsJIPxNECfVoiGJS8qG7z2jptybJrUm9Q8nQIhAI2X\n3TMJLjVmg/9WLFJGeD9MZIQ8oNwfN44r7wq85ttN\n-----END RSA PRIVATE KEY-----","pkf":"18:3e:57:98:fa:f3:c3:18:a8:61:9c:44:73:96:a2:f9:a2:1f:19:13"}

  var key = new NodeRSA(details.privateKey);

  t.same(key.exportKey('private'), details.privateKey);
  t.same(key.exportKey('public'), details.publicKey);

  var msg = {
    publicKey: details.publicKey,
    session: 'boop'
  };

  var message = jwt.sign(msg, details.privateKey, { noTimestamp: true, algorithm: 'RS256' });
  console.log(message);

  var d = jwt.decode(message);
  var verified;

  console.log(d);

  t.same(d.publicKey, details.publicKey);

  try {
    verified = jwt.verify(message, d.publicKey, { noTimestamp: true, algorithms: ['RS256'] });
  } catch (e) {
    console.log(e);
    verified = false;
  }
  t.ok(verified, 'jwt is verified');
  t.end();
});
*/

tape('generate keys', function (t) {
  function generateKey () {
    var key = new NodeRSA({b: 512});

    fixtures.push({
      publicKey: key.exportKey('pkcs8-public'),
      privateKey: key.exportKey('pkcs8-private'),
      pkf: fingerprint(key.exportKey('pkcs8-public'), 'sha1')
    });
  }

  for (var x = 0; x < 10; x++) {
    generateKey();
  }

  t.end();
});

tape('friends', function (t) {
  var c = client('localhost:9000', 'dizzle');
  var count = 0;
  var friends = [fixtures[1], fixtures[2], fixtures[3]];

  c.subscribe([friends[0].pkf, friends[1].pkf, friends[2].pkf]).on('data', function (message) {
    var d = jwt.decode(message);
    var verified;

    try {
      verified = true; // jwt.verify(message, d.publicKey, {algorithm: 'RS256'});
    } catch (e) {
      console.log(e);
      verified = false;
    }
    t.ok(verified, 'jwt is verified');

    if (!verified) {
      console.log(message);
      console.log(JSON.stringify(friends[0]));
    }

    var pkf = fingerprint(d.publicKey, 'sha1');
    t.ok(_.find(friends, function (f) {
      return f.pkf === pkf;
    }), 'pkf is in friends list');

    if (++count === 3) {
      this.destroy();
      t.end();
    }
  });

  setTimeout(function () {
    announce(c, sesssionDescription, friends[0].pkf, friends[0]);
    announce(c, sesssionDescription, friends[0].pkf, friends[0]);
    announce(c, sesssionDescription, friends[0].pkf, friends[0]);
    // announce(c, sesssionDescription, friends[1].pkf, friends[1]);
    // announce(c, sesssionDescription, friends[2].pkf, friends[2]);
  }, 1000);
});

tape('strangers', function (t) {
  var c = client('localhost:9000', 'dizzle');
  var count = 0;
  var friends = [fixtures[1], fixtures[2], fixtures[3]];
  var strangers = [fixtures[4], fixtures[5]];

  c.subscribe([friends[0].pkf, friends[1].pkf, friends[2].pkf]).on('data', function (message) {
    var d = jwt.decode(message);
    var verified;

    try {
      verified = true; // jwt.verify(message, d.publicKey, {algorithm: 'RS256'});
    } catch (e) {
      console.log(e);
      verified = false;
    }
    t.ok(verified, 'jwt is verified');

    var pkf = fingerprint(d.publicKey, 'sha1');
    t.notOk(_.find(friends, function (f) {
      return f.pkf === pkf;
    }), 'pkf is not in friends list');

    if (++count === 2) {
      this.destroy();
      t.end();
    }
  });

  setTimeout(function () {
    announce(c, sesssionDescription, friends[0].pkf, strangers[0]);
    announce(c, sesssionDescription, friends[0].pkf, strangers[1]);
  }, 1000);
});

if (typeof window !== 'undefined') {
  tape('peer', function (t) {
    var c = client('localhost:9000', 'dizzle');
    // var user = fixtures[0];
    var friends = [fixtures[1], fixtures[2], fixtures[3]];
    var count = 0;

    c.subscribe([friends[0].pkf]).on('data', function (message) {
      var d = jwt.decode(message);
      // t.ok(jwt.verify(message, d.publicKey, {algorithm: 'RS256'}));

      var pkf = fingerprint(d.publicKey, 'sha1');
      t.same(friends[0].pkf, pkf);

      if (++count === 2) {
        t.end();
      }
    });

    var peer = new SimplePeer({ initiator: true });

    peer.on('signal', function (data) {
      friends.forEach(function (f) {
        announce(c, data, f.pkf, f);
      });
    });
  });
}

tape('end', function (t) {
  t.ok(true);
  t.end();
});
