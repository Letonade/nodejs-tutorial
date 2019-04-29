
const { Pool } = require('pg');
const fs = require('fs');
const util = require('util');
const unlink = util.promisify(fs.unlink);

module.exports = class FileService {
	constructor(){
		this.pool = new Pool();
	}

	getConnectedClient() {
		const client = new Client();
		return client.connect()
		.then(() => client)
		.catch(err => {
			console.log('err:',err);
			throw err;
		});
	}

	saveFileInfos(fileInfo){
		let client;
		return this.pool.connect()
		.then(connectedClient => {
			client = connectedClient;
			return client.query('BEGIN')
			.then(() => {

			})
			.then(() => {
				return client.query(
				`INSERT INTO filestore("file-name","mime-type","original-name",size,encoding)
				 VALUES ($1,$2,$3,$4,$5)`,
				 [
					 fileInfo.filename,
					 fileInfo.mimetype,
					 fileInfo.originalname,
					 fileInfo.size,
					 fileInfo.encoding
				 ]
				);
			})
			.then(() => {
				return client.query('COMMIT');
			})
			.then(() => {
				client.end();
			})
			.catch(err => {
				console.log('error: ', err);
				return client.query('ROLLBACK')
				.then(() =>	{
					client.release();
					return unlink('data/upload/' + fileInfo.filename);
				})
				.then(() => Promise.reject(err));
			});
		});
	}

	getFileInfos(){
		let client;
		return this.pool.connect()
		.then(connectedClient => {
			client = connectedClient;
			return client.query(
				'SELECT * FROM filestore'
			);
		})
		.then((result) => {
			console.log(result.rows);
			return result.rows;
		})
	}
}
