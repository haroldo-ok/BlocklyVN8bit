/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2012 Google Inc.
 * https://developers.google.com/blockly/
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
 * This is basically a slightly modified version of "field_variable.js"
 */
'use strict';

goog.provide('Blockly.FieldCharacterName');

goog.require('Blockly.FieldDropdown');
goog.require('Blockly.Msg');
goog.require('Blockly.CharacterNames');
goog.require('goog.string');


/**
 * Class for a variable's dropdown field.
 * @param {?string} varname The default name for the variable.  If null,
 *     a unique variable name will be generated.
 * @param {Function=} opt_changeHandler A function that is executed when a new
 *     option is selected.  Its sole argument is the new option value.
 * @extends {Blockly.FieldDropdown}
 * @constructor
 */
Blockly.FieldCharacterName = function(varname, opt_changeHandler) {
  Blockly.FieldCharacterName.superClass_.constructor.call(this,
      Blockly.FieldCharacterName.dropdownCreate, null);
  this.setChangeHandler(opt_changeHandler);
  this.setValue(varname || '');
};
goog.inherits(Blockly.FieldCharacterName, Blockly.FieldDropdown);

/**
 * Sets a new change handler for angle field.
 * @param {Function} handler New change handler, or null.
 */
Blockly.FieldCharacterName.prototype.setChangeHandler = function(handler) {
  var wrappedHandler;
  if (handler) {
    // Wrap the user's change handler together with the variable rename handler.
    var thisObj = this;
    wrappedHandler = function(value) {
      var v1 = handler.call(thisObj, value);
      if (v1 === null) {
        var v2 = v1;
      } else {
        if (v1 === undefined) {
          v1 = value;
        }
        var v2 = Blockly.FieldCharacterName.dropdownChange.call(thisObj, v1);
        if (v2 !== undefined) {
          v2 = v1;
        }
      }
      return v2 === value ? undefined : v2;
    };
  } else {
    wrappedHandler = Blockly.FieldCharacterName.dropdownChange;
  }
  Blockly.FieldCharacterName.superClass_.setChangeHandler(wrappedHandler);
};

/**
 * Install this dropdown on a block.
 * @param {!Blockly.Block} block The block containing this text.
 */
Blockly.FieldCharacterName.prototype.init = function(block) {
  if (this.sourceBlock_) {
    // Dropdown has already been initialized once.
    return;
  }

  if (!this.getValue()) {
    // Variables without names get uniquely named for this workspace.
    if (block.isInFlyout) {
      var workspace = block.workspace.targetWorkspace;
    } else {
      var workspace = block.workspace;
    }
    this.setValue(Blockly.CharacterNames.generateUniqueName(workspace));
  }
  Blockly.FieldCharacterName.superClass_.init.call(this, block);
};

/**
 * Clone this FieldVariable.
 * @return {!Blockly.FieldCharacterName} The result of calling the constructor again
 *   with the current values of the arguments used during construction.
 */
Blockly.FieldCharacterName.prototype.clone = function() {
  return new Blockly.FieldCharacterName(this.getValue(), this.changeHandler_);
};

/**
 * Get the variable's name (use a variableDB to convert into a real name).
 * Unline a regular dropdown, variables are literal and have no neutral value.
 * @return {string} Current text.
 */
Blockly.FieldCharacterName.prototype.getValue = function() {
  return this.getText();
};

/**
 * Set the variable name.
 * @param {string} text New text.
 */
Blockly.FieldCharacterName.prototype.setValue = function(text) {
  this.value_ = text;
  this.setText(text);
};

/**
 * Return a sorted list of variable names for variable dropdown menus.
 * Include a special option at the end for creating a new variable name.
 * @return {!Array.<string>} Array of variable names.
 * @this {!Blockly.FieldCharacterName}
 */
Blockly.FieldCharacterName.dropdownCreate = function() {
  if (this.sourceBlock_ && this.sourceBlock_.workspace) {
    var variableList =
        Blockly.CharacterNames.allVariables(this.sourceBlock_.workspace);
  } else {
    var variableList = [];
  }
  // Ensure that the currently selected variable is an option.
  var name = this.getText();
  if (name && variableList.indexOf(name) == -1) {
    variableList.push(name);
  }
  variableList.sort(goog.string.caseInsensitiveCompare);
  variableList.push(Blockly.Msg.RENAME_VARIABLE);
  variableList.push(Blockly.Msg.NEW_VARIABLE);
  // Variables are not language-specific, use the name as both the user-facing
  // text and the internal representation.
  var options = [];
  for (var x = 0; x < variableList.length; x++) {
    options[x] = [variableList[x], variableList[x]];
  }
  return options;
};

/**
 * Event handler for a change in variable name.
 * Special case the 'New variable...' and 'Rename variable...' options.
 * In both of these special cases, prompt the user for a new name.
 * @param {string} text The selected dropdown menu option.
 * @return {null|undefined|string} An acceptable new variable name, or null if
 *     change is to be either aborted (cancel button) or has been already
 *     handled (rename), or undefined if an existing variable was chosen.
 * @this {!Blockly.FieldCharacterName}
 */
Blockly.FieldCharacterName.dropdownChange = function(text) {
  function promptName(promptText, defaultText) {
	  return new Promise((resolve, reject) => {
		const alertify = require('alertifyjs');
		
		Blockly.hideChaff();
		
		alertify.prompt(promptText, defaultText, 
			(evt, newVar) => {
				// Merge runs of whitespace.  Strip leading and trailing whitespace.
				// Beyond this, all names are legal.
				if (newVar) {
				  newVar = newVar.replace(/[\s\xa0]+/g, ' ').replace(/^ | $/g, '');
				  if (newVar == Blockly.Msg.RENAME_VARIABLE ||
					  newVar == Blockly.Msg.NEW_VARIABLE) {
					// Ok, not ALL names are legal...
					newVar = null;
				  }
				}
				resolve(newVar);
			},
			() => {
				console.log('Prompt cancelled.');
			});		
	  });
  }
  var workspace = this.sourceBlock_.workspace;
  if (text == Blockly.Msg.RENAME_VARIABLE) {
    var oldVar = this.getText();
    promptName(Blockly.Msg.RENAME_VARIABLE_TITLE.replace('%1', oldVar),
                      oldVar)
		.then(text => text && Blockly.CharacterNames.renameVariable(oldVar, text, workspace));
	
    return null;
  } else if (text == Blockly.Msg.NEW_VARIABLE) {
    var block = this;
	promptName(Blockly.Msg.NEW_VARIABLE_TITLE, '')
		.then(text => text && block.setValue(text));
    return null;
  }
  return undefined;
};
