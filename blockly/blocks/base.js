/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2012 Fred Lin.
 * https://github.com/gasolin/BlocklyDuino
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Helper functions for generating Arduino blocks.
 * @author gasolin@gmail.com (Fred Lin)
 */
'use strict';

//To support syntax defined in http://arduino.cc/en/Reference/HomePage

goog.provide('Blockly.Blocks.base');

goog.require('Blockly.Blocks');


Blockly.Blocks['base_delay'] = {
  helpUrl: 'http://arduino.cc/en/Reference/delay',
  init: function() {
    this.setColour(120);
    this.appendValueInput("DELAY_TIME", 'Number')
        .appendField("Delay")
        .setCheck('Number');
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setTooltip('Delay specific time');
  }
};

Blockly.Blocks['base_map'] = {
  helpUrl: 'http://arduino.cc/en/Reference/map',
  init: function() {
    this.setColour(230);
    this.appendValueInput("NUM", 'Number')
        .appendField("Map ")
        .setCheck('Number');
    this.appendValueInput("DMAX", 'Number')
        .appendField("value to [0-")
        .setCheck('Number');
    this.appendDummyInput()
	      .appendField("]");
    this.setInputsInline(true);
    this.setOutput(true);
    this.setTooltip('Re-maps a number from [0-1024] to another.');
  }
};

Blockly.Blocks['inout_buildin_led'] = {
   helpUrl: 'http://arduino.cc/en/Reference/DigitalWrite',
   init: function() {
     this.setColour(190);
     this.appendDummyInput()
	       .appendField("Build-in LED Stat")
	       .appendField(new Blockly.FieldDropdown([["HIGH", "HIGH"], ["LOW", "LOW"]]), "STAT");
     this.setPreviousStatement(true, null);
     this.setNextStatement(true, null);
     this.setTooltip('light or off the build-in LED');
   }
};

Blockly.Blocks['inout_digital_write'] = {
  helpUrl: 'http://arduino.cc/en/Reference/DigitalWrite',
  init: function() {
    this.setColour(230);
    this.appendDummyInput()
	      .appendField("DigitalWrite PIN#")
	      .appendField(new Blockly.FieldDropdown(profile.default.digital), "PIN")
      	.appendField("Stat")
      	.appendField(new Blockly.FieldDropdown([["HIGH", "HIGH"], ["LOW", "LOW"]]), "STAT");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setTooltip('Write digital value to a specific Port');
  }
};

Blockly.Blocks['inout_digital_read'] = {
  helpUrl: 'http://arduino.cc/en/Reference/DigitalRead',
  init: function() {
    this.setColour(230);
    this.appendDummyInput()
	      .appendField("DigitalRead PIN#")
	      .appendField(new Blockly.FieldDropdown(profile.default.digital), "PIN");
    this.setOutput(true, 'Boolean');
    this.setTooltip('');
  }
};

Blockly.Blocks['inout_analog_write'] = {
  helpUrl: 'http://arduino.cc/en/Reference/AnalogWrite',
  init: function() {
    this.setColour(230);
    this.appendDummyInput()
        .appendField("AnalogWrite PIN#")
        .appendField(new Blockly.FieldDropdown(profile.default.digital), "PIN");
    this.appendValueInput("NUM", 'Number')
        .appendField("value")
        .setCheck('Number');
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setTooltip('Write analog value between 0 and 255 to a specific Port');
  }
};

Blockly.Blocks['inout_analog_read'] = {
  helpUrl: 'http://arduino.cc/en/Reference/AnalogRead',
  init: function() {
    this.setColour(230);
    this.appendDummyInput()
        .appendField("AnalogRead PIN#")
        .appendField(new Blockly.FieldDropdown(profile.default.analog), "PIN");
    this.setOutput(true, 'Number');
    this.setTooltip('Return value between 0 and 1024');
  }
};

Blockly.Blocks['inout_tone'] = {
  helpUrl: 'http://www.arduino.cc/en/Reference/Tone',
  init: function() {
    this.setColour(230);
    this.appendDummyInput()
        .appendField("Tone PIN#")
        .appendField(new Blockly.FieldDropdown(profile.default.digital), "PIN");
    this.appendValueInput("NUM", "Number")
        .appendField("frequency")
        .setCheck("Number");
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setTooltip("Generate audio tones on a pin");
  }
};

Blockly.Blocks['inout_notone'] = {
  helpUrl: 'http://www.arduino.cc/en/Reference/NoTone',
  init: function() {
    this.setColour(230);
    this.appendDummyInput()
        .appendField("No tone PIN#")
        .appendField(new Blockly.FieldDropdown(profile.default.digital), "PIN");
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setTooltip("Stop generating a tone on a pin");
  }
};

Blockly.Blocks['inout_highlow'] = {
  helpUrl: 'http://arduino.cc/en/Reference/Constants',
  init: function() {
    this.setColour(230);
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([["HIGH", "HIGH"], ["LOW", "LOW"]]), 'BOOL')
    this.setOutput(true, 'Boolean');
    this.setTooltip('');
  }
};

//servo block
//http://www.seeedstudio.com/depot/emax-9g-es08a-high-sensitive-mini-servo-p-760.html?cPath=170_171
Blockly.Blocks['servo_move'] = {
  helpUrl: 'http://www.arduino.cc/playground/ComponentLib/servo',
  init: function() {
    this.setColour(190);
    this.appendDummyInput()
        .appendField("Servo")
        .appendField(new Blockly.FieldImage("http://www.seeedstudio.com/depot/images/product/a991.jpg", 64, 64))
        .appendField("PIN#")
        .appendField(new Blockly.FieldDropdown(profile.default.digital), "PIN")
    this.appendValueInput("DEGREE", 'Number')
        .setCheck('Number')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("Degree (0~180)");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setTooltip('move between 0~180 degree');
  }
};

Blockly.Blocks['servo_read_degrees'] = {
  helpUrl: 'http://www.arduino.cc/playground/ComponentLib/servo',
  init: function() {
    this.setColour(190);
    this.appendDummyInput()
        .appendField("Servo")
        .appendField(new Blockly.FieldImage("http://www.seeedstudio.com/depot/images/product/a991.jpg", 64, 64))
        .appendField("PIN#")
        .appendField(new Blockly.FieldDropdown(profile.default.digital), "PIN");
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("Read Degrees")
    this.setOutput(true, 'Number');
    this.setTooltip('return that degree with the last servo move.');
  }
};

Blockly.Blocks['vn_label'] = {
  /**
   * Block for defining a procedure with a return value.
   * @this Blockly.Block
   */
  init: function() {
    //this.setHelpUrl(Blockly.Msg.PROCEDURES_DEFRETURN_HELPURL);
    this.setColour(Blockly.Blocks.procedures.HUE);
    var name = Blockly.Procedures.findLegalName(
        Blockly.Msg.PROCEDURES_DEFRETURN_PROCEDURE, this);
    var nameField = new Blockly.FieldTextInput(name,
        Blockly.Procedures.rename);
    nameField.setSpellcheck(false);
    this.appendDummyInput()
        .appendField('Label')
        .appendField(nameField, 'NAME')
        .appendField('', 'PARAMS');
	/*
    this.appendValueInput('RETURN')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(Blockly.Msg.PROCEDURES_DEFRETURN_RETURN)
        .setCheck(["Number", "Boolean"]);
		*/
    //this.setMutator(new Blockly.Mutator(['procedures_mutatorarg']));
    //this.setTooltip(Blockly.Msg.PROCEDURES_DEFRETURN_TOOLTIP);
    this.arguments_ = [];
    this.setStatements_(true);
    this.statementConnection_ = null;
  },
  setStatements_: Blockly.Blocks['procedures_defnoreturn'].setStatements_,
  updateParams_: Blockly.Blocks['procedures_defnoreturn'].updateParams_,
  mutationToDom: Blockly.Blocks['procedures_defnoreturn'].mutationToDom,
  domToMutation: Blockly.Blocks['procedures_defnoreturn'].domToMutation,
  decompose: Blockly.Blocks['procedures_defnoreturn'].decompose,
  compose: Blockly.Blocks['procedures_defnoreturn'].compose,
  dispose: Blockly.Blocks['procedures_defnoreturn'].dispose,
  /**
   * Return the signature of this procedure definition.
   * @return {!Array} Tuple containing three elements:
   *     - the name of the defined procedure,
   *     - a list of all its arguments,
   *     - that it DOES have a return value.
   * @this Blockly.Block
   */
  getProcedureDef: function() {
    return [this.getFieldValue('NAME'), this.arguments_, true];
  },
  getVars: Blockly.Blocks['procedures_defnoreturn'].getVars,
  renameVar: Blockly.Blocks['procedures_defnoreturn'].renameVar,
  customContextMenu: Blockly.Blocks['procedures_defnoreturn'].customContextMenu,
  callType_: 'procedures_callreturn'
};

Blockly.Blocks['vn_say'] = {
  //helpUrl: 'http://www.arduino.cc/en/Serial/Print',
  init: function() {
    this.setColour(230);
    this.appendValueInput("CONTENT", 'String')
        .appendField("Say");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setTooltip('Says something.');
  }
};

Blockly.Blocks['vn_jump'] = {
  //helpUrl: 'http://www.arduino.cc/en/Serial/Print',
  init: function() {
    this.setColour(230);
    this.appendValueInput("TARGET", 'String')
        .appendField("Jump to");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setTooltip('Says something.');
  }
};

Blockly.Blocks['vn_character'] = {
  /**
   * Based on 'variables_set'
   * Block for variable setter.
   * @this Blockly.Block
   */
  init: function() {
	this.appendDummyInput()
		.appendField("Character")
		.appendField(new Blockly.FieldCharacterName(Blockly.FieldCharacterName.NO_CHARACTER), 'CHARACTER_NAME');
	this.setColour(230);
	
	this.setPreviousStatement(true, null);
	this.setNextStatement(true, null);
	this.setTooltip("Chooses who's talking");
  },
  /**
   * Return all variables referenced by this block.
   * @return {!Array.<string>} List of variable names.
   * @this Blockly.Block
   */
  getCharacterNames: function() {
    return [this.getFieldValue('CHARACTER_NAME')];
  },
  /**
   * Notification that a variable is renaming.
   * If the name matches one of this block's variables, rename it.
   * @param {string} oldName Previous name of variable.
   * @param {string} newName Renamed variable.
   * @this Blockly.Block
   */
  renameCharacter: function(oldName, newName) {
    if (Blockly.Names.equals(oldName, this.getFieldValue('CHARACTER_NAME'))) {
      this.setFieldValue(newName, 'CHARACTER_NAME');
    }
  }
};

Blockly.Blocks['vn_window'] = {
  init: function() {
    var TARGETS = [
		['text', 'TEXT'], 
		['menu', 'MENU']
	];

    var COMMANDS = [
		['starting at', 'STARTING_AT'], 
		['ending at', 'ENDING_AT'],
		['size', 'SIZE']
	];
	
	var UNITS = [
		['in chars', 'CHARS'], 
		['%', 'PERCENT']
	];

    this.setColour(230);
	this.appendDummyInput()
		.appendField('Window for')
		.appendField(new Blockly.FieldDropdown(TARGETS), 'TARGET')
		.appendField(new Blockly.FieldDropdown(COMMANDS), 'COMMAND')
		.appendField('(')
		.appendField(new Blockly.FieldTextInput('0', Blockly.FieldTextInput.numberValidator), 'X')
		.appendField(',')
		.appendField(new Blockly.FieldTextInput('0', Blockly.FieldTextInput.numberValidator), 'Y')
		.appendField(')')
		.appendField(new Blockly.FieldDropdown(UNITS), 'UNIT');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setTooltip('Configures window coordinates.');
  }
};

Blockly.Blocks['vn_window_reset'] = {
  init: function() {
    this.setColour(230);
	this.appendDummyInput()
		.appendField('Window reset');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setTooltip('Resets window coordinates.');
  }
};