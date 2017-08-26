'use strict';

(function(){
	
function nextMenuNumber() {
	Blockly.Arduino.menuContexts_.menuCount = (Blockly.Arduino.menuContexts_.menuCount || 0) + 1;	
	return Blockly.Arduino.menuContexts_.menuCount;
}

function getVarStack() {
	Blockly.Arduino.menuContexts_.varStack = Blockly.Arduino.menuContexts_.varStack || [];
	return Blockly.Arduino.menuContexts_.varStack;
}

function getVariables() {
	var varStack = getVarStack();
	return varStack[varStack.length - 1];
}
	
Blockly.Arduino.menu = function() {	
	const menuNumber = nextMenuNumber();		
	const varName = 'mn_option_' + menuNumber;
	const variables = [varName];
	
	getVarStack().push(variables);
	const internalCode = Blockly.Arduino.statementToCode(this, 'DO');
	getVarStack().pop();
	
	return '{\n' + 
		'  int ' + variables.join(', ') + ';\n\n' +
		internalCode + '\n' +
		'  ' + varName + ' = vnMenu();\n' +
		'}';
};

Blockly.Arduino.menu_option = function() {
	const optionNumber = nextMenuNumber();
	const varName = 'mn_choice_' + optionNumber;
	const text = this.getFieldValue('TEXT');
	
	getVariables().push(varName);
	
	return varName + ' = addMenuItem(' + Blockly.Arduino.quote_(text) + ');\n';
}
	
})();