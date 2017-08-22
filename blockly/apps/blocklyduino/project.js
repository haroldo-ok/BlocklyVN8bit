'use strict'

const fs = require('fs');
const path = require('path');
const config = require('./config');

let selectedProjectName = 'test';

function projectPath(subDir) {
	return path.resolve(config.dir('projects'), selectedProjectName, subDir || '');
}

function listImages() {
	var dir = projectPath('bg');
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
		return listImages();
	}
};