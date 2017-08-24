const cmd = require('node-cmd');

const config = require('./config');


module.exports = {
	make: () => {
		const bat = config.fileName('vn32x', 'exec.bat make');
		const processRef = cmd.get(bat, () => console.log('Done.'));
		
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
	}
}