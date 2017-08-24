const cmd = require('node-cmd');

const config = require('./config');

function exec(commandLine) {
	return new Promise((resolve, reject) => {
		const bat = config.fileName('vn32x', 'exec.bat ' + commandLine);
		const processRef = cmd.get(bat, () => resolve());
		
		// listen to the terminal output
		let data_line = '';
		processRef.stdout.on(
			'data',
			function(data) {
				data_line += data;
				if (data_line[data_line.length-1] == '\n') {
					console.log(data_line);
				}
			}
		);
	});	
}

module.exports = {
	make: () => exec('make')
}