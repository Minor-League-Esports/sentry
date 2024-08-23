const log4js = require('log4js');
const logger = log4js.getLogger('MetricsHelper');
const { logLevel } = require('../../config.json');
const { MetricsResponse } = require('../objects/MetricsResponse');
logger.level = logLevel;

class MetricsHelper {
	/**
	 *
	 * @param {MetricsResponse} metricsResponse
	 * @param {Array} rawData
	 */
	constructor(metricsResponse, rawData) {
		this._metrics = metricsResponse;
		this._data = rawData;
	}

	/**
	 *
	 * @returns {MetricsResponse} The response object
	 */
	getMetrics() {
		return this._metrics;
	}

	/**
	 * Calculates the metrics from the raw data and sets them in the metrics response object
	 */
	crunchNumbers() {}
}

module.exports = {
	MetricsHelper
};
