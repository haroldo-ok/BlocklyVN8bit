'use strict';

(function(){
	
Blockly.Arduino.background_image = function() {
	let source = this.getField('SOURCE');
	let varName = source.getText();
	
	let code = 'vnScene(vi_' + varName + ');\n';
	return code;
};

	
})();