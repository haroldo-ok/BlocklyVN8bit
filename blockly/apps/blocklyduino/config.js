'use strict'

const path = require('path');
const fs = require('fs');

const BASE_PATH = path.resolve(__dirname, '../../../');
const CONFIG_PATH = path.join(BASE_PATH, 'config.json');
const PACKAGE_PATH = path.join(BASE_PATH, 'package.json');

let config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
let pkg = JSON.parse(fs.readFileSync(PACKAGE_PATH, "utf8"));

const api = {
	basePath: BASE_PATH,
	dir: name => path.resolve(BASE_PATH, config.dirs[name]),
	fileName: (dirName, fileName) => path.join(api.dir(dirName), fileName),
	package: pkg,
	
	get currentProject() {
		return config.project && config.project.name || 'test';
	},
	
	set currentProject(name) {
		config.project = config.project || {};
		config.project.name = name;
		fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, '\t'), "utf8")
	}
};

const projectsPath = api.dir('projects');
if (!fs.existsSync(projectsPath)){
	fs.mkdirSync(projectsPath);
}

module.exports = api;