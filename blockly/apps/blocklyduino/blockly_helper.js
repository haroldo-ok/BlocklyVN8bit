const { fileName } = require('./config');
const fs = require('fs');
const _ = require('lodash');
const path = require('path');
const config = require('./config');
const project = require('./project');

/**
 * Execute the user's code.
 * Just a quick and dirty eval.  No checks for infinite loops, etc.
 */
function runJS() {
  var code = Blockly.Generator.workspaceToCode('JavaScript');
  try {
    eval(code);
  } catch (e) {
    alert('Program error:\n' + e);
  }
}

/**
 * Backup code blocks to localStorage.
 */
function backup_blocks() {
  if ('localStorage' in window) {
    var xml = Blockly.Xml.workspaceToDom(Blockly.mainWorkspace);
    window.localStorage.setItem('arduino', Blockly.Xml.domToText(xml));
  }
}

/**
 * Restore code blocks from localStorage.
 */
function restore_blocks() {
  if ('localStorage' in window && window.localStorage.arduino) {
    var xml = Blockly.Xml.textToDom(window.localStorage.arduino);
    Blockly.Xml.domToWorkspace(Blockly.mainWorkspace, xml);
  }
}

function rebuild() {
	const topbar = require('topbar');
	const vn32x = require('./vn32x');
	
	topbar.show();
	printToConsole('-----------------------');
	printToConsole('Cleaning up...');
	
	return vn32x.clean()
		.then(compile)
		.then(function(){
			printToConsole('Build done!');
			topbar.hide();
			return Promise.resolve();
		})
		.catch(err => {
			console.error(err);
			printToConsole('Build failed!');
			topbar.hide();
			return Promise.reject();
		});	
}

async function compile() {
	try {
		const topbar = require('topbar');
		const vn32x = require('./vn32x');
		const project = require('./project');
		
		topbar.show();
		printToConsole('-----------------------');
		printToConsole('Starting compilation...');

		await generateCode();
		await delay(500);
		await copyImageFiles();
		await convertImages();

		const portraits = await copyPortraitFiles();
		await generateChunkDefinitions(portraits);
		await convertPortraits();

		await generateBuildScripts();
		
		printToConsole('Compilation done!');
		topbar.hide();
		return Promise.resolve();
	} catch (err) {
		console.error(err);
		printToConsole('Compilation failed!');
		printToConsole(err);
		topbar.hide();
		return Promise.reject();
	};
}

function compileAndRun() {
	const vn32x = require('./vn32x');

	compile()
		.then(async () => await delay(500))
		.then(async () => {
			printToConsole('-----------------------');
			printToConsole('Building and starting emulator...');	
			await vn32x.execConsole(`cd "${path.resolve(buildScriptPath())}" && echo aaa | ${project.current.name}-${platformToRun()}.bat`);
		})
		.catch(err => {
			console.error(err);
			printToConsole('Failed to run emulator!');
		});
}

/**
* Save Arduino generated code to local file.
*/
function saveCode() {
	const vn32x = require('./vn32x');

	printToConsole('-----------------------');
	printToConsole('Generating files...');
	
	generateCode()		
		.then(function(){
			printToConsole('All done!');
			return Promise.success();
		})
		.catch(err => {
			console.error('File generation failed!', err);
			printToConsole('Failed!')
			return Promise.reject();
		});

}

const isExistingFile = async filePath => {
	return new Promise((resolve, reject) => {
		fs.access(filePath, err => resolve(!err));
	});
}

const makeDirIfNotExists = async filePath => {
	return new Promise((resolve, reject) => {
		fs.mkdir(filePath, err => {
			// Ignore "Directory already exists" errors
			if (err && err.code != 'EEXIST') {
				console.log(`Error creating dir ${filePath}`, err);
				reject(err);
				return;
			}

			resolve(fileName);
		});
	});
}

const targetPath = () =>  config.fileName('8bitUnity', 'projects/' + project.current.name + '/');
const pythonPath = () =>  config.fileName('8bitUnity', 'utils/py27/');
const scriptsPath = () =>  config.fileName('8bitUnity', 'utils/scripts/');
const buildScriptPath = () =>  config.fileName('8bitUnity', 'build/');
const unityPath = () =>  config.fileName('8bitUnity', '');

const platformToRun = () => document.getElementById('platformToRun').value
	.replace(/\s/g, '').toLowerCase();

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const createTargetDirectories = async () => {
	const frameworkPath = config.fileName('8bitUnity', '');
	if (!await isExistingFile(frameworkPath)) {
		throw new Error(`Couldn't find 8bit-Unity at '${frameworkPath}'; please check if the installation is correct.`);
	}

	const targetPath = config.fileName('8bitUnity', 'projects/' + project.current.name + '/');
	const subDirs = ['bitmaps', 'chunks', 'music', 'sprites', 'src']
		.map(name => `${targetPath}${name}/`);

	await makeDirIfNotExists(targetPath);
	await Promise.all(subDirs.map(dir => makeDirIfNotExists(dir)));
}

const copyFile = async (originPath, destPath) => {
	const cmd = require('node-cmd');
	return new Promise((resolve, reject) => {
		// TODO: Only works on Windows; should be made more generic.
		cmd.get(`copy "${path.resolve(originPath)}" "${path.resolve(destPath)}"`, (err, data) => {
			if (err) {
				console.error(err);
				reject(new Error('Failed to copy file.'));
				return;
			}
			resolve(data);
		});
	});
}

const copyFiles = async (originPath, destPath) => {
	const cmd = require('node-cmd');
	return new Promise((resolve, reject) => {
		// TODO: Only works on Windows; should be made more generic.
		cmd.get(`xcopy /s/y "${path.resolve(originPath)}" "${path.resolve(destPath)}"`, (err, data) => {
			if (err) {
				console.error(err);
				reject(new Error('Failed to copy files.'));
				return;
			}
			resolve(data);
		});
	});
}

const execPython = async (cmdLine) => {
	const cmd = require('node-cmd');
	return new Promise((resolve, reject) => {
		cmd.get(`"${path.resolve(pythonPath())}/python" ${cmdLine}`, (err, data) => {
			if (err) {
				console.error(err);
				reject(new Error('Failed to execute Python command.'));
				return;
			}
			resolve(data);
		});
	});
}

const execBuilder = async (cmdLine) => {
	const cmd = require('node-cmd');
	return new Promise((resolve, reject) => {
		cmd.get(`cd "${path.resolve(unityPath())}" && _builder_.bat ${cmdLine}`, (err, data) => {
			if (err) {
				console.error(err);
				reject(new Error('Failed to execute builder.'));
				return;
			}
			resolve(data);
		});
	});
}

const copyStandardSourceFiles = async () => {
	return copyFiles(`${__dirname}/base-project`, targetPath());
}

const listBackgroundImages = () => Object.values(Blockly.Arduino.images_)
	.filter(o => o.imgType === 'background');

const listPortraitImages = () => Object.values(Blockly.Arduino.images_)
	.filter(o => o.imgType === 'portrait');

const copyImageFiles = async () => {
	return Promise.all(listBackgroundImages().map(({imgName, imgAbbrev}) => 
		copyFile(`${project.bg.path}/${imgName}.png`, `${targetPath()}/bitmaps/${imgAbbrev}.png`)))		
}

const copyPortraitFiles = async () => {
	return Promise.all(listPortraitImages().map(copyPortraitFile))
}

const copyPortraitFile = async ({imgName, imgAbbrev}) => {
	const img = await loadImage(`${project.portrait.path}/${imgName}.png`);

	const canvas = document.createElement('canvas');
	canvas.width = 320;
	canvas.height = 200;

	const ctx = canvas.getContext('2d');
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	
	// Calculate image size to fit
	const maxHeight = 100;
	let imgWidth = img.width;
	let imgHeight = img.height;			
	if (imgHeight > maxHeight) {
		imgWidth = Math.round(imgWidth * maxHeight / imgHeight);
		imgHeight = maxHeight;
	}
	
	// Center horizontally, allign to bottom
	const x = Math.round((canvas.width - imgWidth) / 2);
	const y = canvas.height - imgHeight;
	ctx.drawImage(img, x, y, imgWidth, imgHeight);

	await saveCanvasToImage(canvas, `${targetPath()}/chunks/${imgAbbrev}.png`);

	return {x, y, w: imgWidth, h: imgHeight, imgName, imgAbbrev};
}

const loadImage = async path => {
	return await new Promise((resolve, reject) => {
		const img = new Image();
		img.src = 'file:/' + path.replace(/\\/g, '/');
		img.onload = () => resolve(img);
		img.onerror = reject;
	});
}

const saveCanvasToImage = async (canvas, path) => {
	return await new Promise((resolve, reject) => {
		// Get the DataUrl from the Canvas
		const url = canvas.toDataURL('image/png');

		// remove Base64 stuff from the Image
		const base64Data = url.replace(/^data:image\/png;base64,/, "");
		fs.writeFile(path, base64Data, 'base64', err => {
			if (err) {
				reject(err);
				return;
			}

			resolve();
		});
	});
}

const generateChunkDefinitions = async portraits => {
	PLATFORMS = [
		{name: 'apple', w: 140, h: 192, mulX: 7, mulY: 1},
		{name: 'atari', w: 160, h: 200, mulX: 4, mulY: 1},
		{name: 'c64', w: 160, h: 200, mulX: 4, mulY: 8},
		{name: 'lynx', w: 160, h: 102, mulX: 2, mulY: 1},
		{name: 'oric', w: 240, h: 200, mulX: 3, mulY: 2}
	];

	const definitions = PLATFORMS.map(platform => {
		const lines = portraits.map(portrait => {
			const scaleX = platform.w / 320;
			const scaleY = platform.h / 200;

			const x1 = Math.floor(portrait.x * scaleX / platform.mulX) * platform.mulX;
			const y1 = Math.floor(portrait.y * scaleY / platform.mulY) * platform.mulY;

			let x2 = Math.ceil((portrait.x + portrait.w) * scaleX / platform.mulX) * platform.mulX;
			x2 = Math.min(platform.w, x2);
			let y2 = Math.ceil((portrait.y + portrait.h) * scaleY / platform.mulY) * platform.mulY;
			y2 = Math.min(platform.h, y2);

			const w = x2 - x1;
			const h = y2 - y1;

			return `'${portrait.imgAbbrev}-${platform.name}.png', '${portrait.imgAbbrev}.cnk', [${x1}, ${y1}, ${w}, ${h}]\t# ${portrait.imgName}`;
		});

		return {
			name: `chunks-${platform.name}.txt`,
			content: `# Chunks definition file\n\n${lines.join('\n')}\n`
		};
	});

	await Promise.all(definitions.map(({name, content}) => new Promise((resolve, reject) => {
		fs.writeFile(`${targetPath()}/chunks/${name}`, content, function(err) {
			if (err) {
				console.warn('Error writing ' + name, err);
				reject(err);
				return;
			}
			
			printToConsole("The chunk file was saved: " + name);
			resolve(name);
		}); 			
	})));

}

const convertImages = async () => {
	return Promise.all(listBackgroundImages().map(({imgAbbrev}) => 
		execPython(`${path.resolve(scriptsPath())}/convert-images.py "${targetPath()}/bitmaps/${imgAbbrev}.png"`)))		
}

const convertPortraits = async () => {
	return Promise.all(listPortraitImages().map(({imgAbbrev}) => 
		execPython(`${path.resolve(scriptsPath())}/convert-images.py "${targetPath()}/chunks/${imgAbbrev}.png"`)))		
}

const generateBuildScripts = async () => {	
	return execBuilder(` -projectFile projects/${project.current.name}/${project.current.name}.builder ` +
		'-useGUI False -callEmu True');
}

const generateBuilderProject = () => {
	const projName = project.current.name;
	const projDir = `projects/${projName}/`;

	const platforms = ['Apple', 'Atari', 'C64', 'Lynx', 'Oric']
		.map(platformName => {
			return [platformName, {
				bitmap: listBackgroundImages().map(({imgName, imgAbbrev}) => 
					`${projDir}bitmaps/${imgAbbrev}-${platformName.toLowerCase()}.png`),
				chunks: [ `${projDir}chunks/chunks-${platformName.toLowerCase()}.txt` ]
			}];
		});

	const builderProject = {
	  "format": "8bit-Unity Project", 
	  "formatVersion": 2, 
	  "general": {
		  "disk": projName, 
		  "code": [
			  projDir + "src/vn_engine.c", 
			  projDir + "src/main.c", 
			  projDir + "src/generated_script.c"
		  ], 
	  }, 
	  "platform": _.fromPairs(platforms)
	};
  
	Blockly.Arduino.otherSources[`${projName}.builder`] = 
	  JSON.stringify(builderProject, null, 4);  
}

async function generateCode() {
	await createTargetDirectories(); 
	await delay(500);
	await copyStandardSourceFiles(); 

	function writeGeneratedFile(fileName, content) {
		return new Promise(async (resolve, reject) => {
			const filePath = `${targetPath()}`;

			fs.writeFile(filePath + fileName, content, function(err) {
				if (err) {
					console.warn('Error writing ' + fileName, err);
					reject(err);
					return;
				}
				
				printToConsole("The file was saved: " + fileName);
				resolve(fileName);
			}); 		
		});
	}
	
	let generatedFiles = [{
		name: 'src/generated_script.c',
		content: Blockly.Arduino.workspaceToCode()
	}];

	generateBuilderProject();
	
	for (var name in Blockly.Arduino.otherSources) {
		generatedFiles.push({
			name: name,
			content: Blockly.Arduino.otherSources[name]
		});
	}
	
	await Promise.all(generatedFiles.map(o => writeGeneratedFile(o.name, o.content)));

	console.log('Generated files written.');
}

function newProject() {
	const topbar = require('topbar');	  
	const alertify = require('alertifyjs');
	
	const project = require('./project');
	
	alertify.prompt('Project name', '', (evt, value) => {
		topbar.show();
		printToConsole("Creating project " + value);
		
		project.current.createNew(value)
			.then(() => {
				topbar.hide();
				console.log("The project was created!");
				printToConsole("The project was created!");
				load();
			})
			.catch(err => {
				topbar.hide();
				console.error('Error creating project', err);
				printToConsole("Error creating project!");
				alertify.error(err);
			});
	});
}

function openProject() {
	const topbar = require('topbar');	  
	const alertify = require('alertifyjs');

	const project = require('./project');
	
	project.current.listProjects()
		.then(projects => new Promise((resolve, reject) => {
			// Builds the select
			let select = document.createElement('select');
			projects.forEach(prj => {
				let option = document.createElement('option');
				option.value = prj.name;
				option.text = prj.name;
				select.appendChild(option);
			});
			
			// Shows the confirmation dialog
			alertify.confirm(select, evt => {
				let selectedProject = select.options[select.selectedIndex].value;
				resolve(selectedProject);
			});
		}))
		// Switch to the project
		.then(selectedProject => {
			topbar.show();
			printToConsole("Loading project " + selectedProject);
			return project.current.switchTo(selectedProject);
		})
		// Load the project
		.then(() => load())
		// If anything goes wrong...
		.catch(err => {
			topbar.hide();
			console.error('Error loading project', err);
			printToConsole("Error loading project!");
			alertify.error(err);
		});
}

function exportProject() {
	const topbar = require('topbar');	  
	const { remote } = require('electron');
	const project = require('./project');

	remote.dialog.showSaveDialog({
		title: 'Export project',
		defaultPath: project.current.name + '.vn32x.zip',
		filters: [
			{name: 'Zip file', extensions: ['zip']}
		]
	}, fileName => {
		save().then(() => {
			topbar.show();
			printToConsole("Exporting to zip...");
			return project.current.exportZip(fileName);
		})
		.then(() => {
			topbar.hide();
			printToConsole("Export successful!");
		})
		.catch(err => {
			topbar.hide();
			
			let msg = "Export failed!";
			console.error(msg, err);		
			printToConsole(msg);
		});
	});
}

function importProject() {
	const topbar = require('topbar');	  
	const alertify = require('alertifyjs');
	const { remote } = require('electron');
	
	const project = require('./project');

	// Ask for file to load
	new Promise((resolve, reject) => {
		remote.dialog.showOpenDialog({
			title: 'Import project',
			filters: [
				{name: 'Zip file', extensions: ['zip']}
			]
		}, fileNames => resolve(fileNames[0]))
	})
	// Ask for project name to load as
	.then(fileName => new Promise((resolve, reject) => {
		alertify.prompt('Project name', '', (evt, projectName) => resolve({fileName, projectName}));
	}))
	// Extract from zip
	.then(o => {
		topbar.show();
		printToConsole("Importing zip...");
		return project.current.importZip(o.fileName, o.projectName)
			.then(() => Promise.resolve(o)); 
	})
	// Import done.
	.then(o => {
		topbar.hide();		
		
		let msg = `Successfully imported project "${o.projectName}". You may open it, if you want.`;
		printToConsole(msg);
		alertify.success(msg);
		
		return Promise.resolve();
	})
	.catch(err => {
		topbar.hide();
		
		let msg = "Import failed!";
		console.error(msg, err);		
		printToConsole(msg);
	});
}

/**
 * Save blocks to local file.
 * better include Blob and FileSaver for browser compatibility
 */
function save() {
	const topbar = require('topbar');	  
	const fs = require('fs');
	const project = require('./project');

	topbar.show();
	printToConsole("Saving project...");
	
	var xml = Blockly.Xml.workspaceToDom(Blockly.mainWorkspace);
	var data = Blockly.Xml.domToPrettyText(xml);
	
	return project.current.save({
		xml: data
	})
	.then(() => {
		topbar.hide();
		console.log("The project was saved!");
		printToConsole("The project was saved!");
		return Promise.resolve();
	})
	.catch(err => {
		topbar.hide();
		
		let msg = "Saving failed!";
		console.error(msg, err);		
		printToConsole(msg);
		return Promise.reject(msg);
	});
}

/**
 * Load blocks from local file.
 */
function load() {
	const topbar = require('topbar');
	const fs = require('fs');
	
	const project = require('./project');
	const image = require('./image');

	topbar.show();
	printToConsole("Loading project...");
	project.current.load()
		.then((data) => {
			console.log("The project was loaded!");
			
			try {
				var xml = Blockly.Xml.textToDom(data.xml);
			} catch (e) {
				console.error('Error parsing XML', e);
				printToConsole("Error parsing XML!");
				topbar.hide();
				return;
			}
			
			Blockly.mainWorkspace.clear();
			Blockly.Xml.domToWorkspace(Blockly.mainWorkspace, xml);			
		
			image.refresh();

			printToConsole("The project was loaded!");
			topbar.hide();
			
			return Promise.resolve();
		})
		.then(showVersionInfo)
		.catch(err => {
			topbar.hide();
			console.error(err);			
			printToConsole("Failed to load the project!");
		});

}

/**
 * Discard all blocks from the workspace.
 */
function discard() {
  var count = Blockly.mainWorkspace.getAllBlocks().length;
  if (count < 2 || window.confirm('Delete all ' + count + ' blocks?')) {
    Blockly.mainWorkspace.clear();
    renderContent();
  }
}

function showVersionInfo() {
	const config = require('./config');
	const project = require('./project');
	const header = document.getElementById('version_header');
	header.innerText = `${config.package.name} ${config.package.version} - ${project.current.name}`;	
}

/*
 * auto save and restore blocks
 */
function auto_save_and_restore_blocks() {
  // Restore saved blocks in a separate thread so that subsequent
  // initialization is not affected from a failed load.
  window.setTimeout(restore_blocks, 0);
  // Hook a save function onto unload.
  bindEvent(window, 'unload', backup_blocks);
  tabClick(selected);

  // Init load event.
  /*
  var loadInput = document.getElementById('load');
  loadInput.addEventListener('change', load, false);
  document.getElementById('fakeload').onclick = function() {
    loadInput.click();
  };
  */
}

/**
 * Bind an event to a function call.
 * @param {!Element} element Element upon which to listen.
 * @param {string} name Event name to listen to (e.g. 'mousedown').
 * @param {!Function} func Function to call when event is triggered.
 *     W3 browsers will call the function with the event object as a parameter,
 *     MSIE will not.
 */
function bindEvent(element, name, func) {
  if (element.addEventListener) {  // W3C
    element.addEventListener(name, func, false);
  } else if (element.attachEvent) {  // IE
    element.attachEvent('on' + name, func);
  }
}

//loading examples via ajax
var ajax;
function createAJAX() {
  if (window.ActiveXObject) { //IE
    try {
      return new ActiveXObject("Msxml2.XMLHTTP");
    } catch (e) {
      try {
        return new ActiveXObject("Microsoft.XMLHTTP");
      } catch (e2) {
        return null;
      }
    }
  } else if (window.XMLHttpRequest) {
    return new XMLHttpRequest();
  } else {
    return null;
  }
}

function onSuccess() {
  if (ajax.readyState == 4) {
    if (ajax.status == 200) {
      try {
      var xml = Blockly.Xml.textToDom(ajax.responseText);
      } catch (e) {
        alert('Error parsing XML:\n' + e);
        return;
      }
      var count = Blockly.mainWorkspace.getAllBlocks().length;
      if (count && confirm('Replace existing blocks?\n"Cancel" will merge.')) {
        Blockly.mainWorkspace.clear();
      }
      Blockly.Xml.domToWorkspace(Blockly.mainWorkspace, xml);
    } else {
      alert("Server error");
    }
  }
}

function load_by_url(uri) {
  ajax = createAJAX();
  if (!ajax) {
　　   alert ('Not compatible with XMLHttpRequest');
　　   return 0;
　  }
  if (ajax.overrideMimeType) {
    ajax.overrideMimeType('text/xml');
  }

　　ajax.onreadystatechange = onSuccess;
　　ajax.open ("GET", uri, true);
　　ajax.send ("");
}

function uploadCode(code, callback) {
    var target = document.getElementById('content_arduino');
    var spinner = new Spinner().spin(target);

    var url = "http://127.0.0.1:8080/";
    var method = "POST";

    // You REALLY want async = true.
    // Otherwise, it'll block ALL execution waiting for server response.
    var async = true;

    var request = new XMLHttpRequest();
    
    request.onreadystatechange = function() {
        if (request.readyState != 4) { 
            return; 
        }
        
        spinner.stop();
        
        var status = parseInt(request.status); // HTTP response status, e.g., 200 for "200 OK"
        var errorInfo = null;
        switch (status) {
        case 200:
            break;
        case 0:
            errorInfo = "code 0\n\nCould not connect to server at " + url + ".  Is the local web server running?";
            break;
        case 400:
            errorInfo = "code 400\n\nBuild failed - probably due to invalid source code.  Make sure that there are no missing connections in the blocks.";
            break;
        case 500:
            errorInfo = "code 500\n\nUpload failed.  Is the Arduino connected to USB port?";
            break;
        case 501:
            errorInfo = "code 501\n\nUpload failed.  Is 'ino' installed and in your path?  This only works on Mac OS X and Linux at this time.";
            break;
        default:
            errorInfo = "code " + status + "\n\nUnknown error.";
            break;
        };
        
        callback(status, errorInfo);
    };

    request.open(method, url, async);
    request.setRequestHeader("Content-Type", "text/plain;charset=UTF-8");
    request.send(code);	     
}

function uploadClick() {
    var code = document.getElementById('content_arduino').value;

    alert("Ready to upload to Arduino.");
    
    uploadCode(code, function(status, errorInfo) {
        if (status == 200) {
            alert("Program uploaded ok");
        } else {
            alert("Error uploading program: " + errorInfo);
        }
    });
}

function resetClick() {
    var code = "void setup() {} void loop() {}";

    uploadCode(code, function(status, errorInfo) {
        if (status != 200) {
            alert("Error resetting program: " + errorInfo);
        }
    });
}

function printToConsole(msg) {
	const $ = require('jquery');
	const $console = printToConsole.$console;
	$('<li>').text(msg).appendTo($console);
	$console.scrollTop($console.prop('scrollHeight'));	
}

function initConsole() {
	(function($){
		const vn32x = require('./vn32x');		
		printToConsole.$console = $('#console_area > ul');
		vn32x.subscribe(printToConsole);
	})(require('jquery'));
}

function initMainProcEvents() {
	const { ipcRenderer } = require('electron');
	// Save/Load
	ipcRenderer.on('newProject', newProject);
	ipcRenderer.on('openProject', openProject);
	ipcRenderer.on('saveProject', save);
	ipcRenderer.on('reloadProject', load);
	ipcRenderer.on('exportProject', exportProject);
	ipcRenderer.on('importProject', importProject);
	// Compilation
	ipcRenderer.on('rebuild', rebuild);
	ipcRenderer.on('compile', compile);
	ipcRenderer.on('compileAndRun', compileAndRun);
}