const $ = require('jquery');
const project = require('./project');
const canvasBuffer = require('electron-canvas-to-buffer');
const fs = require('fs');

rivets.bind($('#content_backgrounds'), {
	data: {
		imageName: 'none',
		canvas: $('#content_backgrounds').find('> div > canvas')[0],
		images: project.bg.items		
	},
	
	controller: {
		selectFile: function(ev, model) {
			console.log('selectFile', this, arguments);
			model.data.imageName = ev.target.files[0].name;
			
			let img = new Image();
			img.onload = () => {
				let canvas = model.data.canvas;
				let ctx = canvas.getContext('2d');				
				ctx.clearRect(0, 0, canvas.width, canvas.height);
				ctx.drawImage(img, 0, 0, canvas.width, canvas.height);				
			}
			img.src = ev.target.files[0].path;
		},
		
		addImage: function(ev, model) {
			console.log('addImage', this, arguments);
			project.saveBackground(model.data.imageName, model.data.canvas).then(() => model.data.images = project.bg.items);
		}
	}
});