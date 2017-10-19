const $ = require('jquery');
const project = require('./project');
const canvasBuffer = require('electron-canvas-to-buffer');
const fs = require('fs');
const path = require('path');

const MAX_WIDTH = 320;
const MAX_HEIGHT = 202;

rivets.formatters.imageName = {
	
	read: value => prepareImageName(value),
	publish: value => prepareImageName(value)
	
};

function prepareImageName(value) {
	return (value || '').trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
}

function prepareImageList(options) {
	let $container = $(options.selector);
	let imageAccessor = project[options.origin];
	
	$container.html($('#image_list_template').html());
	let binding = rivets.bind($container, {
		data: {
			imageName: 'none',
			canvas: $container.find('> div > canvas')[0],
			images: imageAccessor.items		
		},
		
		controller: {
			selectFile: function(ev, model) {
				console.log('selectFile', this, arguments);
				model.data.imageName = path.parse(ev.target.files[0].name).name;
				
				let img = new Image();
				img.onload = () => {
					let canvas = model.data.canvas;
					let ctx = canvas.getContext('2d');				
					ctx.clearRect(0, 0, canvas.width, canvas.height);
					options.prepareImage(img, canvas, ctx);
				}
				img.src = ev.target.files[0].path;
			},
			
			addImage: function(ev, model) {
				console.log('addImage', this, arguments);
				imageAccessor.add(model.data.imageName, model.data.canvas).then(() => refreshImages(model));
			},
			
			deleteImage: function(ev) {
				console.log('deleteImage', this, arguments);
				let imageName = $(this).data('image-name');
				imageAccessor.remove(imageName).then(() => refreshImages(binding.models));
			}
		}
	});	
	
	function refreshImages(model) {
		model.data.images = imageAccessor.items;
	}
	
	return {
		refresh: () => refreshImages(binding.models)
	}
}

module.exports = {

	bg: prepareImageList({
		selector: '#content_backgrounds',
		origin: 'bg',
		prepareImage: (img, canvas, ctx) => {
			canvas.width = MAX_WIDTH;
			canvas.height = MAX_HEIGHT;
			ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
		}
	}),
	
	
	portrait: prepareImageList({
		selector: '#content_portraits',
		origin: 'portrait',
		prepareImage: (img, canvas, ctx) => {			
			// The width must be a multiple of 8.
			let targetWidth = Math.floor((img.width + 7) / 8) * 8;
			
			canvas.width =  Math.min(targetWidth, MAX_WIDTH);
			canvas.height = Math.min(img.height, MAX_HEIGHT - 2);
			
			// Calculate image size to fit
			let imgWidth = img.width;
			let imgHeight = img.height;			
			if (imgHeight > canvas.height) {
				imgWidth = Math.round(imgWidth * canvas.height / imgHeight);
				imgHeight = canvas.height;
			}
			
			// Center horizontally
			let x = Math.round((canvas.width - imgWidth) / 2);
			ctx.drawImage(img, x, 0, imgWidth, imgHeight);
		}
	}),
	
	
	refresh: () => {
		module.exports.bg.refresh();
		module.exports.portrait.refresh();
	}

};
