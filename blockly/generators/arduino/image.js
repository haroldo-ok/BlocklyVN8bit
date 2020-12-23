'use strict';

(function(){

// Convert the filename into something that can be used by 8bit-Unity
const prepareFileName = name => name.toLowerCase().replace(/[^a-z0-9]+/g, '').substring(0, 8);

const getImageAbbreviation = imgName => {
	let imgAbbrev = Blockly.Arduino.imageAbbrevs_.fullToAbbrev[imgName];

	if (!imgAbbrev) {
		// No abbreviation available, yet; create one, in order to fit the 8 char limit.

		imgAbbrev = prepareFileName(imgName);
		if (Blockly.Arduino.imageAbbrevs_.abbrevToFull[imgAbbrev]) {
			// Abbreviation already in use; try adding a numeric suffix.
			let seq = 2;		
			do {
				let suffix = seq.toString();
				let prefix = prepareFileName(imgName).substring(0, 8 - suffix.length);
				imgAbbrev = prefix + suffix;
				seq++;
			} while (Blockly.Arduino.imageAbbrevs_.abbrevToFull[imgAbbrev]);	
		}

		Blockly.Arduino.imageAbbrevs_.fullToAbbrev[imgName] = imgAbbrev;
		Blockly.Arduino.imageAbbrevs_.abbrevToFull[imgAbbrev] = imgName;
	}

	return imgAbbrev;
}
	
function getImage(component, imgType) {
	let source = component.getField('SOURCE');
	
	let imgName = source.getText();
	let imgAbbrev = getImageAbbreviation(imgName);
	let imgExt = imgType == 'portrait' ? 'cnk' : 'img';

	Blockly.Arduino.images_[imgName] = {
		imgType, imgName, imgAbbrev,
		viDecl: `const char *vi_${imgName} = "${imgAbbrev}.${imgExt}";`
	}

	return 'vi_' + imgName;
}
	
Blockly.Arduino.background_image = function() {
	let varName = getImage(this, 'background');
	let code = 'vnScene(' + varName + ');\n';
	return code;
};

Blockly.Arduino.portrait_image = function() {
	let varName = getImage(this, 'portrait');
	let code = 'vnShow(' + varName + ');\n';
	return code;
};
	
})();