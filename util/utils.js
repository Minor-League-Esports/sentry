const log4js = require('log4js');
const logger = log4js.getLogger('Utils');
const { logLevel } = require('../config.json');
logger.level = logLevel;

const { ActionRowBuilder, ButtonComponent } = require('discord.js');

/**
 * Builds action rows from a list of buttons
 * @param  {...ButtonComponent} buttons
 * @returns {ActionRowBuilder[]} An array of built action rows
 */
function buildActionRows(...buttons) {
	if (buttons.length > 25) {
		throw new Error('Too many buttons!');
	}

	let rows = [];
	for (let i = 0; i < buttons.length; i++) {
		let row;
		if (i % 5 === 0) {
			row = new ActionRowBuilder();
		} else {
			row = rows[rows.length - 1];
		}
		row.addComponents(buttons[i]);
		rows[i / 5] = row;
	}
	return rows;
}

/**
 *
 * @param {Number} dateNumber The date in millis
 */
function convertDate(dateNumber) {
	const date = new Date(dateNumber);
	const year = date.getFullYear();
	const month = date.getMonth() + 1;
	const dayOfMonth = date.getDate();
	const dateString = `${month}/${dayOfMonth}/${year}`;
	return dateString;
}

/**
 * Prints the map values in a readable format
 * @param {Map} map The map to convert
 */
function mapToString(map) {
	let ret = '';
	map.forEach((value, key) => {
		ret += `${key}: ${value}\n`;
	});
	return ret;
}

module.exports = {
	buildActionRows,
	convertDate,
	mapToString
};
