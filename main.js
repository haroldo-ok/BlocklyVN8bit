const {app, BrowserWindow, Menu, globalShortcut} = require('electron')
const path = require('path')
const url = require('url')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({width: 800, height: 600})

  // and load the index.html of the app.
  win.loadURL(url.format({
    pathname: path.join(__dirname, 'blockly/apps/blocklyduino/index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Start maximized.
  win.maximize();

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
  });
  
  createMainMenu();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
});

function createMainMenu() {
	const template = [
		{
			label: 'File',
			submenu: [
				{
					label: 'New',
					accelerator: 'CommandOrControl+N',
					click() { sendToMainWindow('newProject', {}); }
				},
				{
					label: 'Open',
					accelerator: 'CommandOrControl+O',
					click() { sendToMainWindow('openProject', {}); }
				},
				{
					label: 'Save',
					accelerator: 'CommandOrControl+S',
					click() { sendToMainWindow('saveProject', {}); }
				},
				{
					label: 'Reload',
					click() { sendToMainWindow('reloadProject', {}); }
				},
				{type: 'separator'},
				{
					label: 'Export',
					accelerator: 'CommandOrControl+E',
					click() { sendToMainWindow('exportProject', {}); }
				},
				{
					label: 'Import',
					accelerator: 'CommandOrControl+I',
					click() { sendToMainWindow('importProject', {}); }
				},
				{type: 'separator'},
				{role: 'quit'}
			]
		},
		{
			label: 'Edit',
			submenu: [
				{role: 'undo'},
				{role: 'redo'},
				{type: 'separator'},
				{role: 'cut'},
				{role: 'copy'},
				{role: 'paste'},
				{role: 'pasteandmatchstyle'},
				{role: 'delete'},
				{role: 'selectall'}
			]
		},
		{
			label: 'Project',
			submenu: [
				{
					label: 'Compile',
					accelerator: 'CommandOrControl+F9',
					click() { sendToMainWindow('compile', {}); }
				},
				{
					label: 'Rebuild',
					accelerator: 'CommandOrControl+Shift+F9',
					click() { sendToMainWindow('rebuild', {}); }
				},
				{
					label: 'Run',
					accelerator: 'F9',
					click() { sendToMainWindow('compileAndRun', {}); }
				}
			]
		},
		{
			label: 'View',
			submenu: [
				{role: 'reload'},
				{role: 'forcereload'},
				{type: 'separator'},
				{role: 'togglefullscreen'}
			]
		},
		{
			role: 'window',
			submenu: [
				{role: 'minimize'},
				{role: 'close'}
			]
		}
	];
	
	const menu = Menu.buildFromTemplate(template);
	Menu.setApplicationMenu(menu);

	globalShortcut.register('CommandOrControl+Shift+I', () => {
		execInMainWindow(win => win.webContents.toggleDevTools());
	});	
	
	function execInMainWindow(f) {
		let win = BrowserWindow.getFocusedWindow();
		win && f(win);
	}
	
	function sendToMainWindow(msgType, contents) {
		execInMainWindow(win => win.webContents.send(msgType, contents));		
	}
}