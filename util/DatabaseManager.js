const log4js = require('log4js');
const logger = log4js.getLogger('DatabaseManager');
const { logLevel } = require('../config.json');
const { MetricsResponse } = require('./objects/MetricsResponse');
const { MLEApplication } = require('./objects/MLEApplication');
logger.level = logLevel;

class DatabaseManager {
	constructor(username, password, server, database) {
		this._username = username;
		this._password = password;
		this._server = server;
		this._database = database;
		this._status = 'init';
	}

	/**
	 * Initializes the database connection
	 * @param None
	 * @returns {Promise<boolean>} A promise to initialize the connection
	 */
	async init() {
		logger.debug('Initialized the database connection');
		// Sets status to 'success' on success and 'failed' on fail
	}

	/**
	 * Gets the user's application
	 * @param {String} userId The user's ID
	 * @returns {Promise<MLEApplication>} A promise to return the application
	 */
	async getApplication(userId) {
		return new Promise((resolve, reject) => {
			const app = new MLEApplication('AnOliveBranch', '222809044103069696', 'test');
			app.setStatus('partial');
			resolve(app);
			return;
			if (this._status === 'init') {
				logger.warn('Tried to get an application, DB manager not initialized');
				reject();
			} else if (this._status === 'failed') {
				logger.warn('Tried to get an application, DB manager failed to initialize');
				reject();
			}
		});
	}

	/**
	 * Saves an application to the database. Creates a new one if it doesn't exist, updates it otherwise
	 * @param {MLEApplication} application The application to save
	 * @returns {Promise<boolean>} A promise of if the application was saved
	 */
	async saveApplication(application) {
		return new Promise((resolve, reject) => {
			if (this._status === 'init') {
				logger.warn('Tried to save an application, DB manager not initialized');
				reject();
			} else if (this._status === 'failed') {
				logger.warn('Tried to save an application, DB manager failed to initialize');
				reject();
			}
		});
	}

	/**
	 * Pulls metrics from the given time window
	 * @param {int} startDate The starting date timestamp (unix)
	 * @param {int} endDate The ending date timestamp (unix)
	 * @returns {Promise<MetricsResponse} A promise of a MetricsResponse object
	 */
	async fetchMetrics(startDate, endDate) {
		return new Promise((resolve, reject) => {
			if (this._status === 'init') {
				logger.warn('Tried to fetch metrics, DB manager not initialized');
				reject('Database connection failed');
			} else if (this._status === 'failed') {
				logger.warn('Tried to fetch metrics, DB manager failed to initialize');
				reject('Database connection failed');
			}
		});
	}

	/**
	 * Closes the connection to the database
	 * @returns {Promise<boolean>} A promise if the connection was closed
	 */
	async close() {
		logger.debug('Closed the db connection');
	}
}

module.exports = {
	DatabaseManager
};
