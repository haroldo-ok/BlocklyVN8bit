const $ = require('jquery');
const project = require('./project');

rivets.bind(require('jquery')('#content_backgrounds'), {
	data: {
		imageName: 'none',
		images: project.backgrounds		
	},
	
	controller: {
		selectFile: function(ev, model) {
			console.log('selectFile', this, arguments);
			model.data.imageName = ev.target.files[0].name;
		},
		
		addImage: function(ev, model) {
			console.log('addImage', this, arguments);
		}
	}
});