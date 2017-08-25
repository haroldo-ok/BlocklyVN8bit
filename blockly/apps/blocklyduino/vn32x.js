const fs = require('fs');
const cmd = require('node-cmd');
const rx = require('rxjs');

const config = require('./config');

const BINARY_NAME = 'generated.32x';

const consoleListener = new rx.Subject();

function exec(commandLine) {
	return new Promise((resolve, reject) => {
		const bat = config.fileName('vn32x', 'exec.bat ' + commandLine);
		const processRef = cmd.get(bat, () => resolve());
		
		// listen to the terminal output
		let data_line = '';
		function dataCallback(data) {
			data_line += data;
			if (data_line[data_line.length-1] == '\n') {
				consoleListener.next(data_line);
			}
		}
		
		processRef.stdout.on('data', dataCallback);
		processRef.stderr.on('data', dataCallback);
	});	
}

function binaryFileName() {
	return config.fileName('vn32x', BINARY_NAME);
}

function binaryExists() {
	return new Promise((resolve, reject) => {
		fs.stat(binaryFileName(), function(err, stat) {
			if (err) {
				if (err.code != 'ENOENT') {
					console.error('Unexpected error while checking for the existance of the binary', err);
				}
				reject(err);
			} else {
				resolve();
			}
		});
	});
}

function deleteBinary() {
	return new Promise((resolve, reject) => {
		fs.unlink(binaryFileName(), function(err, stat) {
			if (err) {
				if (err.code == 'ENOENT') {
					// File already absent
					resolve();
				} else {
					// Actual error
					reject(err);
				}
			} else {
				resolve();
			}
		});
	});
}

function compile() {
	return deleteBinary().then(() => exec('make')).then(binaryExists);
}

module.exports = {
	compile: compile,
	clean: () => exec('make clean'),
	exec: exec,
	subscribe: listener => consoleListener.subscribe({next: listener})
}