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

function compile() {
	const vn32x = require('./vn32x');
	const project = require('./project');
	
	printToConsole('-----------------------');
	printToConsole('Starting compilation...');
	
	return generateCode()	
		.then(() =>  vn32x.copyImagesFrom(project.bg.path))
		.then(() =>  vn32x.copyImagesFrom(project.portrait.path))
		.then(vn32x.compile)
		.then(function(){
			printToConsole('Compilation done!');
			return Promise.resolve();
		})
		.catch(err => {
			console.error(err);
			printToConsole('Compilation failed!');
			return Promise.reject();
		});
}

function compileAndRun() {
	const vn32x = require('./vn32x');

	compile()
		.then(function(){
			printToConsole('-----------------------');
			printToConsole('Starting emulator...');	
			vn32x.run().then(() => printToConsole('Emulator closed.'));
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
		})
		.catch(err => printToConsole('Failed!'));

}

function generateCode() {
	var fs = require('fs');
	var config = require('./config');
	
	function writeGeneratedFile(fileName, content) {
		return new Promise((resolve, reject) => {
			fs.writeFile(config.fileName('vn32x', 'generated/' + fileName), content, function(err) {
				if(err) {
					console.log('Error writing ' + fileName, err);
					reject(err);
					return;
				}
				
				printToConsole("The file was saved: " + fileName);
				resolve(fileName);
			}); 		
		});
	}
	
	let generatedFiles = [{
		name: 'generated_script.c',
		content: Blockly.Arduino.workspaceToCode()
	}];
	
	for (var name in Blockly.Arduino.otherSources) {
		generatedFiles.push({
			name: name,
			content: Blockly.Arduino.otherSources[name]
		});
	}
	
	return Promise.all(generatedFiles.map(o => writeGeneratedFile(o.name, o.content)));
}

/**
 * Save blocks to local file.
 * better include Blob and FileSaver for browser compatibility
 */
function save() {
	var xml = Blockly.Xml.workspaceToDom(Blockly.mainWorkspace);
	var data = Blockly.Xml.domToPrettyText(xml);
  
	var fs = require('fs');
	var config = require('./config');

	fs.writeFile(config.fileName('projects', 'project.xml'), data, function(err) {
		if(err) {
			return console.log(err);
		}

		console.log("The file was saved!");
	}); 
}

/**
 * Load blocks from local file.
 */
function load() {
	var fs = require('fs');
	var config = require('./config');

	fs.readFile(config.fileName('projects', 'project.xml'), "utf8", function(err, data) {
		if (err) {
			return console.log(err);
		}

		console.log("The file was loaded!");
		try {
			var xml = Blockly.Xml.textToDom(data);
		} catch (e) {
			console.error('Error parsing XML', e);
			return;
		}

		Blockly.mainWorkspace.clear();
		Blockly.Xml.domToWorkspace(Blockly.mainWorkspace, xml);
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
	ipcRenderer.on('compileAndRun', compileAndRun);
}