const _ = require('lodash');
	
function update() {
    var overviewContainer = document.getElementById('content_overview');
	var workspace = Blockly.getMainWorkspace();
	var metrics = workspace.getMetrics();

	// Create a copy of Blockly's SVG.
	var svg = '<svg width="' + metrics.contentHeight + '" height="' + metrics.contentWidth + '">' + 
		workspace.svgBlockCanvas_.outerHTML + 
		'</svg>';
	overviewContainer.innerHTML = svg;

	// Collect the coordinates of the child blocks
	var rootG = overviewContainer.querySelector('g');	
	var coords = _.map(rootG.querySelectorAll(':scope > g'), g => { 
		let m = g.transform.baseVal[0].matrix; 
		return {g: g, x: m.e, y: m.f}; 
	});
	
	// Adjusts the root <g> tag so all children are visible
	var minX = _.chain(coords).map('x').min().value();
	var minY = _.chain(coords).map('y').min().value();
	rootG.attributes.getNamedItem('transform').value = 
		'scale(0.15) ' + 
		'translate(' + (-minX) + ', ' + (-minY) + ')';
		
	// On click, changes back to 'blocks' tab, and scrolls to the tab.
	coords.forEach(c => {
		c.g.addEventListener('click', ev => {
			ev.preventDefault();
			tabClick('blocks');
			workspace.scrollbar.set(c.x, c.y + (metrics.viewHeight / 2));
		});
	});
}

module.exports = {
	update: update
};