const fs = require('fs');
const path = require('path');
const cmd = require('node-cmd');
const rx = require('rxjs');

const config = require('./config');

const BINARY_NAME = 'generated.32x';

const consoleListener = new rx.Subject();

function exec(commandLine) {
	const bat = config.fileName('vn32x', 'exec.bat ' + commandLine);
	return execConsole(commandLine);
}

function execConsole(commandLine) {
	return new Promise((resolve, reject) => {
		const processRef = cmd.get(commandLine, () => resolve());
		
		// listen to the terminal output
		let data_line = '';
		function dataCallback(data) {
			data_line += data;
			if (data_line[data_line.length-1] == '\n') {
				consoleListener.next(data_line);
				data_line = '';
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

function copyImagesFrom(originPath) {
	let originGlob = path.resolve(originPath, '*.png');
	let targetDir = config.fileName('vn32x', 'script');	
	let commandLine = `cp "${originGlob}" "${targetDir}" -v -u`;
	return exec(commandLine);
}

function compile() {
	return deleteBinary().then(() => exec('make')).then(binaryExists);
}

module.exports = {
	compile: compile,
	clean: () => exec('make clean'),
	run: () => exec('make run'),
	copyImagesFrom: copyImagesFrom,
	execConsole,
	subscribe: listener => consoleListener.subscribe({next: listener})
}