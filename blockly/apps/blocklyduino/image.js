const $ = require('jquery');
const project = require('./project');

rivets.bind($('#content_backgrounds'), {
	data: {
		imageName: 'none',
		images: project.backgrounds		
	},
	
	controller: {
		selectFile: function(ev, model) {
			console.log('selectFile', this, arguments);
			model.data.imageName = ev.target.files[0].name;
			
			let img = new Image();
			img.onload = () => {
				let canvas = $(ev.target).parent().find('> canvas')[0];
				let ctx = canvas.getContext('2d');
				ctx.drawImage(img, 0, 0, canvas.width, canvas.height);				
			}
			img.src = ev.target.files[0].path;
		},
		
		addImage: function(ev, model) {
			console.log('addImage', this, arguments);
		}
	}
});