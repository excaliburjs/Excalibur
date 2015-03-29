 var travisPing = require('travis-ping');

travisPing.ping('kamranayub', process.env.GH_TOKEN, 'excaliburjs/excaliburjs.github.io', function(travisResponse) {
	console.log(travisResponse);
});