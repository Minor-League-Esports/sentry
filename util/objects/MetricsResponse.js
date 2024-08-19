const log4js = require('log4js');
const logger = log4js.getLogger('MetricsResponse');
const { logLevel } = require('../../config.json');
logger.level = logLevel;

class MetricsResponse {}

module.exports = {
	MetricsResponse
};
