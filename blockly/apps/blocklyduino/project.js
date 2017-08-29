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

module.exports = {
	get backgrounds() {
		return listImages('bg');
	},
	
	get portraits() {
		return listImages('portrait');
	},
	
	saveBackground: function(name, canvas) {
		let buffer = canvasBuffer(canvas, 'image/png');
		let fileName = name + ".png";
		let dir = projectPath('bg');
		fs.writeFile(path.resolve(dir, fileName), buffer, function (err) {
			if (err) {
				console.error('Error writing ' + fileName, err);
				return;
			}
		});
	}
};