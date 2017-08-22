'use strict'

const path = require('path');
const fs = require('fs');

const BASE_PATH = path.resolve(__dirname, '../../../');
const CONFIG_PATH = path.join(BASE_PATH, 'config.json');

let config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));

const api = {
	basePath: BASE_PATH,
	dir: name => path.resolve(BASE_PATH, config.dirs[name]),
	fileName: (dirName, fileName) => path.join(api.dir(dirName), fileName)
};

module.exports = api;