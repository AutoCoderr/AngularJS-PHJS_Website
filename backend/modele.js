"use strict";

const mysql = require("mysql");

module.exports = class Modele {
	constructor(host, user, password, database)  {
		this.conn = mysql.createConnection({
			host: host,
			user: user,
			password: password,
			database: database
		});
		this.conn.connect();
		this.ended = false;
	}

	select(columns, tables, conditions = "1 = 1", callback) {
		if (conditions === "") {
			conditions = "1 = 1";
		}
		this.conn.query('SELECT '+columns+' FROM '+tables+' WHERE '+conditions, (error, results, fields) => {
			if (error) {
				callback(error);
				return;
			}
			callback(null, results);
			if (!this.ended) {
				this.conn.end();
				this.ended = true;
			}
		});
	}

	insert(table, datas, callback) {
		let datasStr = "";
		for (let i=0;i<datas.length;i++) {
			if (typeof(datas[i]) === "string") {
				datasStr += "'"+datas[i]+"'";
			} else {
				datasStr += datas[i];
			}
			if (i < datas.length-1) {
				datasStr += ", ";
			}
		}
		this.conn.query("INSERT INTO "+table+" VALUE ("+datasStr+")", (error, result) => {
			if (error) {
				callback(error,result);
				return;
			}
			callback(null,result);
			if (!this.ended) {
				this.conn.end();
				this.ended = true;
			}
		});
	}

	delete(table,conditions = "1 = 1", callback) {
		if (conditions === "") {
			conditions = "1 = 1";
		}
		this.conn.query("DELETE FROM "+table+" WHERE "+conditions, (error, result) => {
			if (error) {
				callback(error);
				return;
			}
			callback(null);
			if (!this.ended) {
				this.conn.end();
				this.ended = true;
			}
		});
	}

	update(table,sets,conditions = "1 = 1", callback) {
		if (conditions === "") {
			conditions = "1 = 1";
		}

		let setStr = "";
		for (let key in sets) {
			if (typeof(sets[key]) === "string") {
				setStr += key+" = '"+sets[key]+"'";
			} else {
				setStr += key+" = "+sets[key];
			}
			setStr += ", ";
		}
		setStr = setStr.substring(0,setStr.length-2);
		this.conn.query("UPDATE "+table+" SET "+setStr+" WHERE "+conditions, (error, result) => {
			if (error) {
				callback(error);
				return;
			}
			callback(null);
			if (!this.ended) {
				this.conn.end();
				this.ended = true;
			}
		});
	}

};