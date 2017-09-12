'use strict'

const fs = require('fs');
const path = require('path');

const canvasBuffer = require('electron-canvas-to-buffer');
const _ = require('lodash');

const config = require('./config');

const BASE_PROJECT_INFO = {
	format: 1,
	ide: _.pick(config.package, 'name', 'version')
};

let selectedProjectName = 'test';

let projectInfo = newProjectInfo();

function projectRootPath() {
	return config.dir('projects');
}

function projectPath(subDir) {
	return path.resolve(projectRootPath(), selectedProjectName, subDir || '');
}

function listImages(subDir) {
	var dir = projectPath(subDir);
	var images = fs.readdirSync(dir).reduce((list, name) => {
		let extName = path.extname(name);
		if (/^\.(png|jpg|jpeg)$/.test(extName)) {
			var onlyFName = path.basename(name, extName);
			list.push({
				name: onlyFName,
				fullPath: path.resolve(dir, name)
			});
		}
		return list;
	}, []);
	
	return images;
}

function saveText(fileName, content) {
	return new Promise((resolve, reject) => {
		fs.writeFile(path.resolve(projectPath(), fileName), content, function(err) {
			if (err) {
				reject(err);
			} else {
				resolve();
			}
		}); 
	});	
}

function loadText(fileName) {
	return loadTextFromPath(path.resolve(projectPath(), fileName));	
}

function loadTextFromPath(fullPath) {
	return new Promise((resolve, reject) => {
		fs.readFile(fullPath, "utf8", function(err, data) {
			if (err) {
				reject(err);
			} else {
				resolve(data);
			}
		});
	});	
}

function newProjectInfo() {
	return _.clone(BASE_PROJECT_INFO);
}

function updateProjectStructure() {
	
	// Converts pre-0.6.4 format
	function updatePre064() {
		if (selectedProjectName != 'test') {
			// If the project name is not 'test', then it probably does not come from that version; nothing to do.
			return Promise.resolve();
		}
		
		let fullPaths = ['project.xml', 'test/project.xml'].map(fileName => path.resolve(projectRootPath(), fileName));

		let filesExist = Promise.all(fullPaths.map(fullPath => {
			return new Promise((resolve, reject) => fs.access(fullPath, err => resolve(!err)));
		})).then(oldFileExists => Promise.resolve(_.every(oldFileExists)));
		
		return filesExist.then(oldFilesExist => {
			if (!oldFilesExist) {
				// Is not in the old format
				return Promise.resolve();
			}
			
			console.warn('Detected a project file genereted by a version prior to 0.6.4; updating.');
			
			return loadTextFromPath(fullPaths[0])
				// Copy XML to the correct place and create project.json
				.then(xml => Promise.all([
					saveText('blockly.xml', xml),
					saveText('project.json', '{format: 1}')
				]))
				// Delete old files
				.then(() => Promise.all(fullPaths.map(fullPath => {
					return new Promise((resolve, reject) => {
						fs.unlink(fullPath, err => {
							if (err) {
								reject(err);
							} else {
								resolve();
							}
						});
					});
				})))
				// Log success
				.then(() => {
					console.info('Upgraded project to 0.6.4');
					return Promise.resolve();
				});
		});
	}
	
	return updatePre064();
}

function ProjectAccessor() {
	return {
		save: content => {
			_.extend(projectInfo, BASE_PROJECT_INFO);
			
			return Promise.all([
				saveText('blockly.xml', content.xml),
				saveText('project.json', JSON.stringify(projectInfo, null, '\t'))
			]);
		},
		
		load: () => {
			return updateProjectStructure()
				.then(() => {
					return Promise.all([
						loadText('blockly.xml'),
						loadText('project.json')
					])
					.then(arr => {
						let [xml, info] = arr;
						projectInfo = JSON.parse(info);
						return Promise.resolve({xml, info});
					});
				});			
		}
	};
}

function ImagePathAccessor(subDir) {
	let acc = {
		
		get items() {
			return listImages(subDir);
		},		
		
		get path() {
			return projectPath(subDir);
		},
		
		add: (name, canvas) => {
			return new Promise((resolve, reject) => {
				let buffer = canvasBuffer(canvas, 'image/png');
				let fileName = name + ".png";
				fs.writeFile(path.resolve(acc.path, fileName), buffer, function (err) {
					if (err) {
						console.error('Error writing ' + fileName, err);
						reject();
					} else {
						resolve();					
					}				
				});			
			});			
		},
		
		remove: name => {
			return new Promise((resolve, reject) => {
				fs.unlink(path.resolve(acc.path, name + '.png'), err => {
					if (err) {
						console.error('Error deleting ' + name, err);
						reject();
					} else {
						resolve();
					}
				});
			});
		}
		
	};
	return acc;
}

module.exports = {

	current: new ProjectAccessor(),
	
	bg: new ImagePathAccessor('bg'),
	portrait: new ImagePathAccessor('portrait')
	
};