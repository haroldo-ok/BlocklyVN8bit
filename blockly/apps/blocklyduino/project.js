'use strict'

const fs = require('fs');
const path = require('path');

const canvasBuffer = require('electron-canvas-to-buffer');

const config = require('./config');

let selectedProjectName = 'test';

function projectPath(subDir) {
	return path.resolve(config.dir('projects'), selectedProjectName, subDir || '');
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

function imgPathAccessor(subDir) {
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
		}
		
	};
	return acc;
}

module.exports = {

	bg: imgPathAccessor('bg'),
	portrait: imgPathAccessor('portrait')
	
};