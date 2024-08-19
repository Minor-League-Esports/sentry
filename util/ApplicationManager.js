const log4js = require('log4js');
const logger = log4js.getLogger('ApplicationManager');
const { logLevel } = require('../config.json');
logger.level = logLevel;

class ApplicationManager {}

module.exports = {
	ApplicationManager
};
