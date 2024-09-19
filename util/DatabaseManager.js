const log4js = require('log4js');
const logger = log4js.getLogger('DatabaseManager');
const { database, logLevel } = require('../config.json');
const { MetricsHelper } = require('./helpers/MetricsHelper');
const { MetricsResponse } = require('./objects/MetricsResponse');
const { MLEApplication } = require('./objects/MLEApplication');
logger.level = logLevel;

const { Client } = require('pg');

class DatabaseManager {
	constructor() {
		this._status = 'init';
		this._client = new Client({
			user: database['username'],
			password: database['password'],
			host: database['hostname'],
			port: database['port'],
			database: database['database']
		});
	}

	/**
	 * Initializes the database connection
	 * @param None
	 * @returns {Promise<boolean>} A promise to initialize the connection
	 */
	async init() {
		// Sets status to 'success' on success and 'failed' on fail
		return this._client
			.connect()
			.then(async () => {
				await this._client.query('DROP TABLE Applications');
				this._client
					.query(
						`
					CREATE TABLE IF NOT EXISTS Applications (
						appID SERIAL PRIMARY KEY,
						userID VARCHAR(20) NOT NULL,
						userName VARCHAR(64) NOT NULL,
						userAvatar VARCHAR(255) NOT NULL,
						status VARCHAR(10) NOT NULL,
						agree BOOLEAN,
						age INT,
						twitter VARCHAR(255),
						newToDiscord VARCHAR(255),
						referral VARCHAR(255),
						leagues VARCHAR(255),
						whyInterested VARCHAR(4000),
						whyFit VARCHAR(4000),
						whatToxic VARCHAR(4000),
						howReact VARCHAR(4000),
						startTimestamp TIMESTAMPTZ NOT NULL,
						submitTimestamp TIMESTAMPTZ,
						reviewTimestamp TIMESTAMPTZ,
						completeTimestamp TIMESTAMPTZ
					)
					`
					)
					.then(async () => {
						await this._client.query(`
							PREPARE get_application_by_user_id (text) AS
							SELECT * FROM Applications 
							WHERE userID = $1
							ORDER BY startTimestamp DESC
							LIMIT 1
							`);
						await this._client.query(`
							PREPARE create_new_application (bigint, text, text, text, text) AS
							INSERT INTO Applications (startTimestamp, userID, userName, userAvatar, status) VALUES (to_timestamp($1/1000.0),$2,$3,$4,$5)
							`);
						await this._client.query(`
							PREPARE save_application (int, text, int, text, text, text, text, text, text, text, text, date, date, date, boolean) AS
							UPDATE Applications SET 
							status = $2, 
							age = $3, 
							twitter = $4, 
							newToDiscord = $5, 
							referral = $6, 
							leagues = $7, 
							whyInterested = $8, 
							whyFit = $9, 
							whatToxic = $10, 
							howReact = $11, 
							submitTimestamp = $12, 
							reviewTimestamp = $13, 
							completeTimestamp = $14,
							agree = $15
							WHERE appID = $1
							`);
						this._status = 'success';
						logger.debug('Initialized the database connection');
					})
					.catch((error) => {
						logger.error('Failed to create table!');
						logger.error(error);
					});
			})
			.catch((error) => {
				logger.error('DB Connection error!');
				logger.error(error);
				this._status = 'failed';
			});
	}

	/**
	 * Gets the user's application
	 * If one does not exist, creates a new one and saves it to the database
	 * @param {String} userId The user's ID
	 * @returns {Promise<MLEApplication>} A promise to return the application
	 */
	async getApplication(userId) {
		return new Promise((resolve, reject) => {
			// return resolve(this.createTestApplication());
			// return reject('No application found');
			if (this._status === 'init') {
				logger.warn('Tried to save an application, DB manager not initialized');
				reject('DB manager not initialized');
			} else if (this._status === 'failed') {
				logger.warn('Tried to save an application, DB manager failed to initialize');
				reject('DB manager failed to initialize');
			}

			// Get the application from the database
			const query = `EXECUTE get_application_by_user_id('${userId}')`;
			this._client
				.query(query)
				.then((result) => {
					const application = this.parseDBResponse(result);
					if (application === null) {
						return reject('No application found');
					}
					return resolve(application);
				})
				.catch((error) => {
					logger.error('Error getting application!');
					logger.error(error);
					return reject('No application found');
				});
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

			const date = Date.now();
			const query = `EXECUTE create_new_application(${date},'${userId}','${userName}','${userAvatar}','init')`;

			this._client
				.query(query)
				.then(() => {
					this.getApplication(userId)
						.then((application) => {
							return resolve(application);
						})
						.catch((error) => {
							logger.error('Error fetching created application!');
							logger.error(error);
							return reject();
						});
				})
				.catch((error) => {
					logger.error('Error creating application!');
					logger.error(error);
					return reject();
				});
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

			const query = `EXECUTE save_application(
			${application.getId()},
			'${application.getStatus()}',
			${application.getAge()},
			'${application.getTwitter()}',
			'${application.getNewDiscord()}',
			'${application.getReferral()}',
			'${application.getLeagues()}',
			'${application.getWhyInterested()}',
			'${application.getWhyFit()}',
			'${application.getWhatToxic()}',
			'${application.getHowReact()}',
			${application.getSubmitTimestamp()},
			${application.getReviewTimestamp()},
			${application.getCompleteTimestamp()},
			${application.getAgree()}
			)`;

			logger.debug(query);

			this._client
				.query(query)
				.then(() => {
					return resolve();
				})
				.catch((error) => {
					logger.error('Error saving application!');
					logger.error(error);
					return reject();
				});
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
		application.setStatus('pending');
		application.setStartTimestamp(1724002762000);
		application.setAgree(true);
		application.setAge(23);
		application.setTwitter('@anolivebranch');
		application.setNewDiscord(false);
		application.setReferral('friend: TyTy');
		application.setLeagues('rl, comm');
		application.setWhyInterested('selkfjeslifj');
		application.setWhyFit('slselfkj');
		application.setWhatToxic('sehfosih');
		application.setHowReact('selkjflske');

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

	/**
	 * Parses raw database data into an MLEApplication object
	 * @param {*} result The raw DB data
	 * @returns {MLEApplication} The parsed application
	 */
	parseDBResponse(result) {
		const rows = result.rows;
		logger.debug(rows);

		if (rows.length === 0) {
			return null;
		}

		const appRow = rows[0];
		const userId = appRow['userid'];
		const userName = appRow['username'];
		const userAvatar = appRow['useravatar'];

		const application = new MLEApplication(userId, userName, userAvatar);

		application.setId(appRow['appid']);
		application.setStatus(appRow['status']);
		application.setAgree(appRow['agree']);
		application.setAge(appRow['age']);
		application.setTwitter(appRow['twitter']);
		application.setNewDiscord(appRow['newtodiscord']);
		application.setReferral(appRow['referral']);
		application.setLeagues(appRow['leagues']);
		application.setWhyInterested(appRow['whyinterested']);
		application.setWhyFit(appRow['whyfit']);
		application.setWhatToxic(appRow['whattoxic']);
		application.setHowReact(appRow['howreact']);
		application.setStartTimestamp(appRow['starttimestamp']);
		application.setSubmitTimestamp(appRow['submittimestamp']);
		application.setReviewTimestamp(appRow['reviewtimestamp']);
		application.setCompleteTimestamp(appRow['completetimestamp']);

		return application;
	}
}

module.exports = {
	DatabaseManager
};
