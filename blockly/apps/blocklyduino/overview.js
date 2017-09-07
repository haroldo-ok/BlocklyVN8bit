const _ = require('lodash');
	
function update() {
	updateMiniatures();
	updateSearch();
}

function updateMiniatures() {
    var overviewContainer = document.querySelector('.overview-content');
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

function updateSearch() {
	let overviewContainer = document.querySelector('.overview-content');
	let searchContainer = document.querySelector('.overview-search');
	
	let elementsToIndex = _.chain(overviewContainer.querySelectorAll('.blocklyEditableText'))
		.map(el => {
			let text = el.textContent
				.replace('\u25BE', '') // Remove arrows
				.replace(/\s+/g, ' '); // Normalize spaces				
			
			return {
				text: text,
				element: el
			};
		})
		.value();
	
	rivets.bind(searchContainer, {
		data: {
			results: elementsToIndex
		},
		
		controller: {
			
		}
	});
}

module.exports = {
	update: update
};