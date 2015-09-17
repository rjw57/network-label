// run file through browserify:
// browserify main.js > bundle.js

var ip = require('ip');

var DNS_SERVERS=[
  { prefixLen: 24, cidr: '129.169.154.0', server: '129.169.154.5' },
  { prefixLen: 16, cidr: '129.169.0.0', server: '129.169.10.10' },
];

var WINS_SERVERS=[
  { prefixLen: 16, cidr: '129.169.0.0', server: '129.169.10.110' },
  { prefixLen: 16, cidr: '129.169.0.0', server: '129.169.8.9' },
];

function dnsQueryA(name) {
  var url = 'http://api.statdns.com/' + encodeURIComponent(name) + '/a';
  return $.getJSON(url);
}

function lookupHost(name) {
  return dnsQueryA(name).then(function(r) {
    for(var i in r.answer) {
      var a = r.answer[i];
      if(a.type === "A") { return { ip: a.rdata, name: a.name }; }
    }
    throw new Error('no A record in response');
  });
}

function addField(name, value) {
  var tr=$('<tr>'), th=$('<th>'), td=$('<td>');
  th.text(name);
  td.text(value);
  tr.append(th, td);
  $('#outputTable').append(tr);
}

function processSpec(spec) {
  $('#outputTable').empty();
  lookupHost(spec.hn).then(function(data) {
    var n, i, subnet = ip.subnet(data.ip, spec.sm);
    console.log(subnet);
    addField('Name:', data.name);
    addField('IP:', data.ip);
    addField('Mask:', spec.sm);
    addField('GW:', ip.or(subnet.networkAddress, spec.gw));

    n = 0;
    for(i in DNS_SERVERS) {
      var r = DNS_SERVERS[i];
      var cidr = ip.cidr(data.ip + '/' + r.prefixLen);
      if(cidr == r.cidr) {
        n += 1;
        addField('DNS' + n + ':', r.server);
      }
    }

    n = 0;
    for(i in WINS_SERVERS) {
      var r = WINS_SERVERS[i];
      var cidr = ip.cidr(data.ip + '/' + r.prefixLen);
      if(cidr == r.cidr) {
        n += 1;
        addField('WINS' + n + ':', r.server);
      }
    }
  });
}

$(document).ready(function() {
  var h = location.hash.substr(1);
  if(h !== '') {
    processSpec(JSON.parse(
      new Buffer(decodeURIComponent(h), 'base64').toString('ascii')
    ));
  }

  $('#hostForm').submit(function(ev) {
    ev.preventDefault();

    var hostName = $('#hostName').val(),
        subnetMask = ip.fromPrefixLen($('#prefixLen').val()),
        gw = $('#gateway').val();

    var spec = { hn: hostName, sm: subnetMask, gw: gw };
    location.hash = encodeURIComponent(
      new Buffer(JSON.stringify(spec)).toString('base64')
    );
    processSpec(spec);
  });
});
