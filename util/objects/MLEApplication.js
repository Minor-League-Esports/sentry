const { Embed, EmbedBuilder } = require('discord.js');

class MLEApplication {
	/**
	 * Creates a new application
	 * @param {String} userId
	 * @param {String} userName
	 * @param {String} userAvatar
	 */
	constructor(userId, userName, userAvatar) {
		this._userId = userId;
		this._userName = userName;
		this._userAvatar = userAvatar;
		this._status = 'init';
		this._startTimestamp = Date.now();
	}

	/**
	 * Sets the ID for the application, determined by the database
	 * @param {int} id
	 */
	setId(id) {
		this._id = id;
	}

	/**
	 * Gets the unique ID of the application
	 * @returns {int} The unique ID
	 */
	getId() {
		return this._id;
	}

	/**
	 * Gets the user's discord ID
	 * @returns {String} The user's ID
	 */
	getUserId() {
		return this._userId;
	}

	/**
	 * Gets the user's name
	 * @returns {String} The user's name
	 */
	getUsername() {
		return this._userName;
	}

	/**
	 * Gets the user's discord avatar
	 * @returns {String} The link to the user's avatar
	 */
	getUserAvatar() {
		return this._userAvatar;
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

	/**
	 * Sets if agreed
	 * @param {boolean} agree
	 */
	setAgree(agree) {
		this._agree = agree;
	}

	/**
	 * Gets if the user has agreed
	 * @returns {boolean} Whether they have agreed
	 */
	getAgree() {
		return this._agree ?? false;
	}

	/**
	 *
	 * @param {int} age
	 */
	setAge(age) {
		this._age = age;
	}

	/**
	 *
	 * @returns {int}
	 */
	getAge() {
		return this._age ?? -1;
	}

	/**
	 *
	 * @param {String} twitter
	 */
	setTwitter(twitter) {
		this._twitter = twitter;
	}

	/**
	 *
	 * @returns {String}
	 */
	getTwitter() {
		return this._twitter ?? 'Not answered';
	}

	/**
	 *
	 * @param {boolean} newDiscord
	 */
	setNewDiscord(newDiscord) {
		this._newDiscord = newDiscord;
	}

	/**
	 *
	 * @returns {boolean}
	 */
	getNewDiscord() {
		return this._newDiscord ?? 'Not answered';
	}

	/**
	 *
	 * @param {String} referral
	 */
	setReferral(referral) {
		this._referral = referral;
	}

	/**
	 *
	 * @returns {String}
	 */
	getReferral() {
		return this._referral ?? 'Not answered';
	}

	/**
	 *
	 * @param {String} leagues
	 */
	setLeagues(leagues) {
		this._leagues = leagues;
	}

	/**
	 *
	 * @returns {String}
	 */
	getLeagues() {
		return this._leagues ?? 'Not answered';
	}

	/**
	 *
	 * @param {String} whyInterested
	 */
	setWhyInterested(whyInterested) {
		this._whyInterested = whyInterested;
	}

	/**
	 *
	 * @returns {String}
	 */
	getWhyInterested() {
		return this._whyInterested ?? 'Not answered';
	}

	/**
	 *
	 * @param {String} whyFit
	 */
	setWhyFit(whyFit) {
		this._whyFit = whyFit;
	}

	/**
	 *
	 * @returns {String}
	 */
	getWhyFit() {
		return this._whyFit ?? 'Not answered';
	}

	/**
	 *
	 * @param {String} whatToxic
	 */
	setWhatToxic(whatToxic) {
		this._whatToxic = whatToxic;
	}

	/**
	 *
	 * @returns {String}
	 */
	getWhatToxic() {
		return this._whatToxic ?? 'Not answered';
	}

	/**
	 *
	 * @param {String} howReact
	 */
	setHowReact(howReact) {
		this._howReact = howReact;
	}

	/**
	 *
	 * @returns {String}
	 */
	getHowReact() {
		return this._howReact ?? 'Not answered';
	}

	/**
	 *
	 * @param {int} timestamp
	 */
	setStartTimestamp(timestamp) {
		this._startTimestamp = timestamp;
	}

	/**
	 *
	 * @returns {int}
	 */
	getStartTimestamp() {
		return this._startTimestamp;
	}

	/**
	 *
	 * @param {int} timestamp
	 */
	setSubmitTimestamp(timestamp) {
		this._submitTimestamp = timestamp;
	}

	/**
	 *
	 * @returns {int}
	 */
	getSubmitTimestamp() {
		return this._submitTimestamp ?? -1;
	}

	/**
	 *
	 * @param {int} timestamp
	 */
	setReviewTimestamp(timestamp) {
		this._reviewTimestamp = timestamp;
	}

	/**
	 *
	 * @returns {int}
	 */
	getReviewTimestamp() {
		return this._reviewTimestamp ?? -1;
	}

	/**
	 *
	 * @param {int} timestamp
	 */
	setCompleteTimestamp(timestamp) {
		this._completeTimestamp = timestamp;
	}

	/**
	 *
	 * @returns {int}
	 */
	getCompleteTimestamp() {
		return this._completeTimestamp ?? -1;
	}

	/**
	 * Generates the embed message containing the application
	 * @returns {Embed}
	 */
	toString() {
		return new EmbedBuilder()
			.setColor('#00ff00')
			.setTitle(`MLE Application: ${this.getUsername()}`)
			.setFooter({ text: `ID: ${this.getUserId()}` })
			.setTimestamp(this.getStartTimestamp())
			.setThumbnail(
				'https://cdn.discordapp.com/emojis/1270034202548768868.webp?size=128&quality=lossless'
			)
			.addFields(
				{
					name: 'Age',
					value: this.getAge().toString()
				},
				{
					name: 'X/Twitter Handle',
					value: this.getTwitter()
				},
				{
					name: 'New to Discord?',
					value: this.getNewDiscord().toString()
				},
				{
					name: 'How did you hear about MLE?',
					value: this.getReferral()
				},
				{
					name: 'What parts of MLE are you interested in?',
					value: this.getLeagues()
				},
				{
					name: 'Why are you interested in being part of the MLE community?',
					value: this.getWhyInterested()
				},
				{
					name: 'Why do you think you would be a good fit for our community?',
					value: this.getWhyFit()
				},
				{
					name: 'What do you consider toxic behavior within a community?',
					value: this.getWhatToxic()
				},
				{
					name: 'How would you react if a person becomes aggressive/angry/toxic with you?',
					value: this.getHowReact()
				}
			);
	}
}

module.exports = {
	MLEApplication
};
