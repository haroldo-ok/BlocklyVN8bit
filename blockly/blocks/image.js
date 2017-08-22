'use strict'

Blockly.Blocks['demo_image'] = {
	/**
	* Demo block for image changing.
	* @this Blockly.Block
	*/
	init: function() {
		const project = require('./project');
		
		var options = project.backgrounds.map(o => [o.name, o.fullPath]);
		options = options.length ? options : [['no_image', '']];
		
		var dropdown = new Blockly.FieldDropdown(options,
		function(newOp) {
			this.sourceBlock_.getField('IMAGE').setValue(newOp);
		});
		this.appendDummyInput()
			.appendField('Background')
			.appendField(dropdown, 'SOURCE')
			.appendField(new Blockly.FieldImage('', 96, 72, '*'), 'IMAGE');
		this.getField('IMAGE').EDITABLE = true;
		this.setColour(20);
		
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setTooltip('Shows a background image.');
	}
};