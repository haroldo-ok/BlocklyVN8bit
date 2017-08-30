const $ = require('jquery');
const project = require('./project');
const canvasBuffer = require('electron-canvas-to-buffer');
const fs = require('fs');

function prepareImageList(options) {
	let $container = $(options.selector);
	let imageAccessor = project[options.origin];
	
	$container.html($('#image_list_template').html());
	rivets.bind($container, {
		data: {
			imageName: 'none',
			canvas: $container.find('> div > canvas')[0],
			images: imageAccessor.items		
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
				project.saveBackground(model.data.imageName, model.data.canvas).then(() => model.data.images = imageAccessor.items);
			}
		}
	});	
}

[
	{
		selector: '#content_backgrounds',
		origin: 'bg'
	},

	{
		selector: '#content_portraits',
		origin: 'portrait'
	}
].forEach(prepareImageList);