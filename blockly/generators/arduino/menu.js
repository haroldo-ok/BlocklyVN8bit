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

function getMenuOptionCodes() {
	Blockly.Arduino.menuContexts_.menuOptionCodes = Blockly.Arduino.menuContexts_.menuOptionCodes || {};
	return Blockly.Arduino.menuContexts_.menuOptionCodes;
}
	
Blockly.Arduino.menu = function() {	
	const menuNumber = nextMenuNumber();		
	const varName = 'mn_option_' + menuNumber;
	const variables = [varName];
	
	getVarStack().push(variables);
	const internalCode = Blockly.Arduino.statementToCode(this, 'DO');
	getVarStack().pop();
	
	const optionBodies = variables.slice(1).map(menuVar => getMenuOptionCodes()[menuVar]);
	
	return '{\n' + 
		'  int ' + variables.join(', ') + ';\n\n' +
		internalCode + '\n' +
		'  ' + varName + ' = vnMenu();\n\n' +
		Blockly.Arduino.prefixLines(optionBodies.join('\n\n'), Blockly.Arduino.INDENT) + 
		'\n}\n';
};

Blockly.Arduino.menu_option = function() {
	const optionNumber = nextMenuNumber();
	const varName = 'mn_choice_' + optionNumber;
	const text = this.getFieldValue('TEXT');
	const internalCode = Blockly.Arduino.statementToCode(this, 'DO');
	
	getVariables().push(varName);

	const optionCode = 'if (' + getVariables()[0] + ' == ' + varName + ') {\n' +
	internalCode + '\n}';
	
	getMenuOptionCodes()[varName] = optionCode;
	
	return varName + ' = addMenuItem(' + Blockly.Arduino.quote_(text) + ');\n';
}
	
})();