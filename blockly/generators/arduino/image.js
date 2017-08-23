'use strict';

(function(){
	
Blockly.Arduino.background_image = function() {
	let source = this.getField('SOURCE');
	
	let imgName = source.getText();
	Blockly.Arduino.images_[imgName] = {
		vgDecl: 'extern uint16 vg_' + imgName + '[];\n',
		viDecl: 'const uint16 *vi_' + imgName + ' = vg_' + imgName + ';'
	}
	
	let code = 'vnScene(vi_' + imgName + ');\n';
	return code;
};

	
})();