

var config = require('./configuration');
var common = require('./common');
var dockerImage = require('../docker/image.js');
var async = require('async');
var exec = require('child_process').exec,
	spawn = require('child_process').spawn;



var imageHosts = Object.keys(common.getClusterNodes()).map(function(ip){return 'tcp://' + ip + ':2375';});

module.exports = {
	removeImage : function(name, cb) {
		var tasks = [];
		imageHosts.forEach(function(imageHost){
			tasks.push(function(cb){
				dockerImage.remove(name, cb, imageHost);
			});
		});
		async.series(tasks, cb);
	},
	swarmManager : function(cb) {
		var name = 'swarm_manager';
		masterIp = config.config.cluster.master.internal_ip;
		process.env.DOCKER_HOST = 'tcp://' + masterIp + ':2375';
		
		stopSwarm(startSwarm);

		function startSwarm() {
			var args = ['run', '-d', '-p', '2000:2375', '--name="' + name + '"', 'swarm', 'manage'],
			nodes = config.config.cluster.nodes,
			nodeHosts = [];

			nodeHosts.push(masterIp + ':2375');
			nodes.forEach && nodes.forEach(function(n){
				nodeHosts.push(n.internal_ip + ':2375');
			});
			args.push(nodeHosts.join(','));

			var managerStart = spawn('docker', args, {"cwd":tempFolder + name, "env" : process.env});

			managerStart.stdout.on('data', function(data) { 
				console.log(data); 
			});
			managerStart.stdout.on('end', function(data) {
				console.log(data);
			});
			managerStart.on('exit', function(code) {
				console.log('Exit with CODE: ' + code);
			});
		}
		

		function stopSwarm(cb) {
			var command = 'docker -H ' + process.env.DOCKER_HOST + ' rm -f ' + name;
			exec(command, function(err, stdout, stderr) {
				if(err) console.log(err);
				cb();
			});

		}
	}
};




