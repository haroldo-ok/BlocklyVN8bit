'use strict'

const fs = require('fs');
const path = require('path');
const config = require('./config');

function listImages() {
	var dir = config.dir('projects');
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