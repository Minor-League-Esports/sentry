const log4js = require('log4js');
const logger = log4js.getLogger('DatabaseManager');
const { logLevel } = require('../config.json');
const { MetricsHelper } = require('./helpers/MetricsHelper');
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
	 * If one does not exist, creates a new one and saves it to the database
	 * @param {String} userId The user's ID
	 * @returns {Promise<MLEApplication>} A promise to return the application
	 */
	async getApplication(userId) {
		return new Promise((resolve, reject) => {
			return resolve(this.createTestApplication());
			return reject('No application found');
			if (this._status === 'init') {
				logger.warn('Tried to save an application, DB manager not initialized');
				reject('DB manager not initialized');
			} else if (this._status === 'failed') {
				logger.warn('Tried to save an application, DB manager failed to initialize');
				reject('DB manager failed to initialize');
			}

			// Get the application from the database
			const query = 'SELECT * FROM Applications WHERE userID = ?';
			const params = [userId];
			const result = null;
			if (result) {
				const application = this.parseDBResponse(result);
			} else {
				return reject('No application found');
			}
		});
	}

	/**
	 * Creates a new application and saves it to the database
	 * @param {String} userId
	 * @param {String} userName
	 * @param {String} userAvatar
	 * @returns {Promise<MLEApplication>} A promise to return the new application
	 */
	async createNewApplication(userId, userName, userAvatar) {
		return new Promise((resolve, reject) => {
			if (this._status === 'init') {
				logger.warn('Tried to save an application, DB manager not initialized');
				reject('DB manager not initialized');
			} else if (this._status === 'failed') {
				logger.warn('Tried to save an application, DB manager failed to initialize');
				reject('DB manager failed to initialize');
			}

			const application = new MLEApplication(userId, userName, userAvatar);
			const query =
				'INSERT INTO Applications (userID, useName, userAvatar, status) VALUES (?,?,?,?)';
			const params = [userId, userName, userAvatar, 'init'];
			// execute the query
			application.setId(1);
			return application;
			return this.getApplication(userId);
			resolve();
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
				reject('DB manager not initialized');
			} else if (this._status === 'failed') {
				logger.warn('Tried to save an application, DB manager failed to initialize');
				reject('DB manager failed to initialize');
			}

			resolve();
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
			return resolve(this.createDummyMetrics(startDate, endDate));
			if (this._status === 'init') {
				logger.warn('Tried to save an application, DB manager not initialized');
				reject('DB manager not initialized');
			} else if (this._status === 'failed') {
				logger.warn('Tried to save an application, DB manager failed to initialize');
				reject('DB manager failed to initialize');
			}

			// TODO: get the data
			const data = null;

			const response = new MetricsResponse(startDate, endDate);
			const helper = new MetricsHelper(response, data);
			helper.crunchNumbers();
			return resolve(helper.getMetrics());
		});
	}

	/**
	 * Closes the connection to the database
	 * @returns {Promise<boolean>} A promise if the connection was closed
	 */
	async close() {
		logger.debug('Closed the db connection');
	}

	/**
	 * Creates a tester application
	 * @return {MLEApplication} The application
	 */
	createTestApplication() {
		const application = new MLEApplication(
			'222809044103069696',
			'AnOliveBranch',
			'https://cdn.discordapp.com/avatars/222809044103069696/6899804950721a373752aabe8478c177.webp'
		);

		application.setId(1);
		application.setStatus('partial');
		application.setStartTimestamp(1724002762000);
		application.setAge(23);
		// application.setTwitter('@anolivebranch');
		// application.setNewDiscord(false);

		return application;
	}

	createDummyMetrics(startDate, endDate) {
		const metrics = new MetricsResponse(startDate, endDate);
		metrics.setApplicationCount(83);
		const referralMap = new Map();
		referralMap.set('Twitch', 13);
		referralMap.set('Twitter', 8);
		referralMap.set('Instagram', 3);
		referralMap.set('Referred by a Friend', 42);
		metrics.setReferralMap(referralMap);

		const leagueMap = new Map();
		leagueMap.set('Rocket League', 58);
		leagueMap.set('Trackmania', 25);
		leagueMap.set('Broadcasting/Commentating', 3);
		leagueMap.set('Community Only', 8);
		metrics.setLeagueMap(leagueMap);

		return metrics;
	}

	parseDBResponse(application) {
		const newApplication = new MLEApplication();

		return newApplication;
	}
}

module.exports = {
	DatabaseManager
};
