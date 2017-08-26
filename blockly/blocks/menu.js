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
  /**
   * Block for if/elseif/else condition.
   * @this Blockly.Block
   */
  init: function() {
//    this.setHelpUrl(Blockly.Msg.CONTROLS_IF_HELPURL);
    this.setColour(MENU_HUE);
    this.appendDummyInput()
	      .appendField(MSG_MENU);
    this.setPreviousStatement(true);
    this.setNextStatement(false);
    this.setMutator(new Blockly.Mutator(['controls_menu_option']));
    this.optionCount_ = 0;
  },
  /**
   * Create XML to represent the number of else-if and else inputs.
   * @return {Element} XML storage element.
   * @this Blockly.Block
   */
  mutationToDom: function() {
    if (!this.optionCount_) {
      return null;
    }
    var container = document.createElement('mutation');
    if (this.optionCount_) {
      container.setAttribute('option', this.optionCount_);
    }
    return container;
  },
  /**
   * Parse XML to restore the else-if and else inputs.
   * @param {!Element} xmlElement XML storage element.
   * @this Blockly.Block
   */
  domToMutation: function(xmlElement) {
    this.optionCount_ = parseInt(xmlElement.getAttribute('option'), 10) || 0;
    for (var i = 1; i <= this.optionCount_; i++) {
      this.appendValueInput('IF' + i)
          .setCheck('Boolean')
          .appendField(MSG_MENU_OPTION)
		  .appendField(this.newQuote_(true))
		  .appendField(new Blockly.FieldTextInput(''), 'TEXT' + i)
		  .appendField(this.newQuote_(false))
          .appendField(MSG_MENU_IF);
      this.appendStatementInput('DO' + i);
    }
  },
  /**
   * Populate the mutator's dialog with this block's components.
   * @param {!Blockly.Workspace} workspace Mutator's workspace.
   * @return {!Blockly.Block} Root block in mutator.
   * @this Blockly.Block
   */
  decompose: function(workspace) {
    var containerBlock = Blockly.Block.obtain(workspace, 'controls_menu_menu');
    containerBlock.initSvg();
    var connection = containerBlock.getInput('STACK').connection;
    for (var i = 1; i <= this.optionCount_; i++) {
      var optionBlock = Blockly.Block.obtain(workspace, 'controls_menu_option');
      optionBlock.initSvg();
      connection.connect(optionBlock.previousConnection);
      connection = optionBlock.nextConnection;
    }
    return containerBlock;
  },
  /**
   * Reconfigure this block based on the mutator dialog's components.
   * @param {!Blockly.Block} containerBlock Root block in mutator.
   * @this Blockly.Block
   */
  compose: function(containerBlock) {
    // Disconnect all the elseif input blocks and remove the inputs.
    for (var i = this.optionCount_; i > 0; i--) {
		try {
		  this.removeInput('IF' + i);
		  this.removeInput('DO' + i);
		  this.removeInput('TEXT' + i);			
		} catch (e) {
			console.error(e);
		}
    }
    this.optionCount_ = 0;
    // Rebuild the block's optional inputs.
    var clauseBlock = containerBlock.getInputTargetBlock('STACK');
    while (clauseBlock) {
      switch (clauseBlock.type) {
        case 'controls_menu_option':
          this.optionCount_++;
          var optionInput = this.appendValueInput('IF' + this.optionCount_)
              .setCheck('Boolean')
              .appendField(MSG_MENU_OPTION)
              .appendField(this.newQuote_(true))
              .appendField(new Blockly.FieldTextInput(''), 'TEXT' + this.optionCount_)
              .appendField(this.newQuote_(false))
              .appendField(MSG_MENU_IF);
          var doInput = this.appendStatementInput('DO' + this.optionCount_);
          doInput.appendField(Blockly.Msg.CONTROLS_IF_MSG_THEN);
          // Reconnect any child blocks.
          if (clauseBlock.valueConnection_) {
            optionInput.connection.connect(clauseBlock.valueConnection_);
          }
          if (clauseBlock.statementConnection_) {
            doInput.connection.connect(clauseBlock.statementConnection_);
          }
          break;
        default:
          throw 'Unknown block type.';
      }
      clauseBlock = clauseBlock.nextConnection &&
          clauseBlock.nextConnection.targetBlock();
    }
  },
  /**
   * Store pointers to any connected child blocks.
   * @param {!Blockly.Block} containerBlock Root block in mutator.
   * @this Blockly.Block
   */
  saveConnections: function(containerBlock) {
    var clauseBlock = containerBlock.getInputTargetBlock('STACK');
    var i = 1;
    while (clauseBlock) {
      switch (clauseBlock.type) {
        case 'controls_menu_option':
          var inputIf = this.getInput('IF' + i);
          var inputDo = this.getInput('DO' + i);
          clauseBlock.valueConnection_ =
              inputIf && inputIf.connection.targetConnection;
          clauseBlock.statementConnection_ =
              inputDo && inputDo.connection.targetConnection;
          i++;
          break;
        default:
          throw 'Unknown block type.';
      }
      clauseBlock = clauseBlock.nextConnection &&
          clauseBlock.nextConnection.targetBlock();
    }
  },
  
  /**
   * Create an image of an open or closed quote.
   * @param {boolean} open True if open quote, false if closed.
   * @return {!Blockly.FieldImage} The field image of the quote.
   * @this Blockly.Block
   * @private
   */
  newQuote_: function(open) {
    if (open == this.RTL) {
      var file = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAKCAQAAAAqJXdxAAAAqUlEQVQI1z3KvUpCcRiA8ef9E4JNHhI0aFEacm1o0BsI0Slx8wa8gLauoDnoBhq7DcfWhggONDmJJgqCPA7neJ7p934EOOKOnM8Q7PDElo/4x4lFb2DmuUjcUzS3URnGib9qaPNbuXvBO3sGPHJDRG6fGVdMSeWDP2q99FQdFrz26Gu5Tq7dFMzUvbXy8KXeAj57cOklgA+u1B5AoslLtGIHQMaCVnwDnADZIFIrXsoXrgAAAABJRU5ErkJggg==';
    } else {
      var file = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAKCAQAAAAqJXdxAAAAn0lEQVQI1z3OMa5BURSF4f/cQhAKjUQhuQmFNwGJEUi0RKN5rU7FHKhpjEH3TEMtkdBSCY1EIv8r7nFX9e29V7EBAOvu7RPjwmWGH/VuF8CyN9/OAdvqIXYLvtRaNjx9mMTDyo+NjAN1HNcl9ZQ5oQMM3dgDUqDo1l8DzvwmtZN7mnD+PkmLa+4mhrxVA9fRowBWmVBhFy5gYEjKMfz9AylsaRRgGzvZAAAAAElFTkSuQmCC';
    }
    return new Blockly.FieldImage(file, 12, 12, '"');
  }
};

Blockly.Blocks['controls_menu_menu'] = {
  /**
   * Mutator block for if container.
   * @this Blockly.Block
   */
  init: function() {
    this.setColour(Blockly.Blocks.menu.HUE);
    this.appendDummyInput()
        .appendField(Blockly.Msg.CONTROLS_IF_IF_TITLE_IF);
    this.appendStatementInput('STACK');
    this.setTooltip(Blockly.Msg.CONTROLS_IF_IF_TOOLTIP);
    this.contextMenu = false;
  }
};

Blockly.Blocks['controls_menu_option'] = {
  /**
   * Mutator bolck for else-if condition.
   * @this Blockly.Block
   */
  init: function() {
    this.setColour(Blockly.Blocks.menu.HUE);
    this.appendDummyInput()
        .appendField(Blockly.Msg.CONTROLS_IF_ELSEIF_TITLE_ELSEIF);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip(Blockly.Msg.CONTROLS_IF_ELSEIF_TOOLTIP);
    this.contextMenu = false;
  }
};

})();