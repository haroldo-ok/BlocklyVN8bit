'use strict';

(function(){

Blockly.Blocks['menu'] = {
  init: function() {
    this.jsonInit({
      "previousStatement": null,
      "nextStatement": null,
      "colour": 190,
      "tooltip": 'Menu'
    });
	this.appendDummyInput()
		.appendField('Menu');
    this.appendStatementInput('CONTENT');
  }
};

})();