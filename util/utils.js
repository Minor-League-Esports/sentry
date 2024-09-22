const log4js = require('log4js');
const logger = log4js.getLogger('Utils');
const { logLevel } = require('../config.json');
logger.level = logLevel;

const { ActionRowBuilder, ButtonComponent } = require('discord.js');
const date = require('date-and-time');

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

function parseTimeInput(input) {
	input = input.toLowerCase();
	const now = new Date();

	if (input === 'none') {
		return now;
	} else if (input === 'permanent') {
		return null; // or some other representation of "permanent"
	} else {
		const match = input.match(/(\d+)\s(month|months)/);
		if (match) {
			const months = parseInt(match[1], 10);
			return date.addMonths(now, months);
		} else {
			throw new Error('Invalid input format');
		}
	}
}

function escape(input) {
	return input.replace("'", "''");
}

module.exports = {
	buildActionRows,
	convertDate,
	mapToString,
	parseTimeInput,
	escape
};
