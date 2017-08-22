'use strict'

Blockly.Blocks['demo_image'] = {
	/**
	* Demo block for image changing.
	* @this Blockly.Block
	*/
	init: function() {
		//var config = require('./config');
		
		var options = [
			['no', 'https://neil.fraser.name/common/no.gif'],
			['yes', 'https://neil.fraser.name/common/yes.gif']
		];
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