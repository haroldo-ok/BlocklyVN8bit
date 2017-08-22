'use strict'

Blockly.Blocks['demo_image'] = {
	/**
	* Demo block for image changing.
	* @this Blockly.Block
	*/
	init: function() {
		console.log(__dirname);
		
		const fs = require('fs');
		const path = require('path');
		const config = require('../../config');
		
		var dir = config.dir('projects');
		var options = fs.readdirSync(dir).reduce((list, name) => {
			let extName = path.extname(name);
			if (/^\.(png|jpg|jpeg)$/.test(extName)) {
				var onlyFName = path.basename(name, extName);
				list.push([onlyFName, path.resolve(dir, name)]);
			}
			return list;
		}, []);
		
		var dropdown = new Blockly.FieldDropdown(options,
		function(newOp) {
			this.sourceBlock_.getField('IMAGE').setValue(newOp);
		});
		this.appendDummyInput()
			.appendField(dropdown, 'SOURCE')
			.appendField(new Blockly.FieldImage('', 11, 11, '*'), 'IMAGE');
		this.getField('IMAGE').EDITABLE = true;
		this.setColour(20);
	}
};