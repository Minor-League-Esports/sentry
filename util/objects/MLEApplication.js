const log4js = require('log4js');
const logger = log4js.getLogger('MLEApplication');
const { logLevel } = require('../../config.json');
logger.level = logLevel;

class MLEApplication {
	/**
	 * Creates a new application
	 * @param {String} userName
	 * @param {String} userId
	 * @param {String} userAvatar
	 */
	constructor(userName, userId, userAvatar) {
		this._userName = userName;
		this._userId = userId;
		this._userAvatar = userAvatar;
		this._status = 'init';
	}

	/**
	 * Sets the status
	 * @param {String} status
	 */
	setStatus(status) {
		this._status = status;
	}

	/**
	 * Gets the status
	 * @returns {String} The status
	 */
	getStatus() {
		return this._status;
	}
}

module.exports = {
	MLEApplication
};
