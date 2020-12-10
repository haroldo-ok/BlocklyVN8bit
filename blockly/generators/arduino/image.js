'use strict';

(function(){
	
function getImage(component) {
	let source = component.getField('SOURCE');
	
	let imgName = source.getText();
	Blockly.Arduino.images_[imgName] = {
		viDecl: `const char *vi_${imgName} = "${imgName}.img";`
	}

	return 'vi_' + imgName;
}
	
Blockly.Arduino.background_image = function() {
	let varName = getImage(this);
	let code = 'vnScene(' + varName + ');\n';
	return code;
};

Blockly.Arduino.portrait_image = function() {
	let varName = getImage(this);
	let code = 'vnShow(' + varName + ');\n';
	return code;
};
	
})();