const log4js = require('log4js');
const logger = log4js.getLogger('ApplicationManager');
const { logLevel } = require('../config.json');
const { DatabaseManager } = require('./DatabaseManager');
const { MLEApplication } = require('./objects/MLEApplication');
logger.level = logLevel;

class ApplicationManager {
	constructor() {
		this._dbManager = new DatabaseManager();
	}

	async init() {
		await this._dbManager.init();
	}

	/**
	 * Creates a new application in the database and returns it
	 * @param {String} userId
	 * @param {String} userName
	 * @param {String} userAvatar
	 * @returns {MLEApplication} The newly created application
	 */
	async createNewApplication(userId, userName, userAvatar) {
		return this._dbManager.createNewApplication(userId, userName, userAvatar);
	}

	/**
	 * Gets an application from the cache if cached, otherwise fetches from database
	 *
	 * @param {String} userId
	 * @returns {MLEApplication} The application
	 */
	async getApplication(userId) {
		return this._dbManager.getApplication(userId);
	}

	async saveApplication(userId, application) {
		logger.debug(`Saving application for ${userId}`);
		logger.debug(application);
		return this._dbManager.saveApplication(application);
	}
}

module.exports = {
	ApplicationManager
};
