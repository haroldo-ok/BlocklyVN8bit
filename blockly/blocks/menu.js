'use strict';

(function(){

goog.provide('Blockly.Blocks.menu');

goog.require('Blockly.Blocks');	

// TODO: Move those constants to the proper Blockly object.
const MENU_HUE = 190;
const MSG_MENU = 'Menu';
const MSG_MENU_IF = 'if';
const MSG_MENU_OPTION = 'Option';

Blockly.Blocks['menu'] = {
	init: function() {
		this.setColour(MENU_HUE);

		this.appendDummyInput()
			.appendField(MSG_MENU);
			
		this.appendStatementInput('DO')		
			.setCheck('MenuOption');
		
		this.setPreviousStatement(true);
		this.setNextStatement(true);
	}
};

Blockly.Blocks['menu_option'] = {
	init: function() {
		this.setColour(MENU_HUE);
		
		this.appendDummyInput("OPTION")
			.appendField(MSG_MENU_OPTION)
			.appendField(newQuote(true))
			.appendField(new Blockly.FieldTextInput(''), 'TEXT')
			.appendField(newQuote(false));
			
		this.appendStatementInput('DO');
		
		this.setPreviousStatement(true, 'MenuOption');
		this.setNextStatement(true, 'MenuOption');
	}
};

Blockly.Blocks['menu_option_if'] = {
	init: function() {
		this.setColour(MENU_HUE);
		
		this.appendValueInput('CONDITION')
			.setCheck('Boolean')
			.appendField(MSG_MENU_OPTION)
			.appendField(newQuote(true))
			.appendField(new Blockly.FieldTextInput(''), 'TEXT')
			.appendField(newQuote(false))
			.appendField(MSG_MENU_IF);
			
		this.appendStatementInput('DO');
		
		this.setPreviousStatement(true, 'MenuOption');
		this.setNextStatement(true, 'MenuOption');
	}
};

function newQuote(open) {
	if (!open) {
	  var file = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAKCAQAAAAqJXdxAAAAqUlEQVQI1z3KvUpCcRiA8ef9E4JNHhI0aFEacm1o0BsI0Slx8wa8gLauoDnoBhq7DcfWhggONDmJJgqCPA7neJ7p934EOOKOnM8Q7PDElo/4x4lFb2DmuUjcUzS3URnGib9qaPNbuXvBO3sGPHJDRG6fGVdMSeWDP2q99FQdFrz26Gu5Tq7dFMzUvbXy8KXeAj57cOklgA+u1B5AoslLtGIHQMaCVnwDnADZIFIrXsoXrgAAAABJRU5ErkJggg==';
	} else {
	  var file = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAKCAQAAAAqJXdxAAAAn0lEQVQI1z3OMa5BURSF4f/cQhAKjUQhuQmFNwGJEUi0RKN5rU7FHKhpjEH3TEMtkdBSCY1EIv8r7nFX9e29V7EBAOvu7RPjwmWGH/VuF8CyN9/OAdvqIXYLvtRaNjx9mMTDyo+NjAN1HNcl9ZQ5oQMM3dgDUqDo1l8DzvwmtZN7mnD+PkmLa+4mhrxVA9fRowBWmVBhFy5gYEjKMfz9AylsaRRgGzvZAAAAAElFTkSuQmCC';
	}
	return new Blockly.FieldImage(file, 12, 12, '"');
}

})();