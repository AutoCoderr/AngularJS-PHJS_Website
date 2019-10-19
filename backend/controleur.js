'use strict';

let crypto = require("crypto");
let shelljs = require("shelljs");
let sql_logins = require("./sql_logins.js"); // put all logins in an other file that is not pushed to protect my logins

let Modele = require("./modele.js");

module.exports = class Controleur {
	constructor(host = 'localhost', user = sql_logins.user, password = sql_logins.passwd, database = sql_logins.database) {
		this.modele = new Modele(host, user, password, database);
	}

	jouets_list(user_id, callback) {
		this.modele.select("J.IDJ as id, J.NOMJ as nomj, CA.NOMC as cat, CO.PRENOMCOMPTE as prenom, CO.NOMCOMPTE as nom, J.DESCRIPTION as description, J.STATUT as statut",
						  "JOUETS J, CATEGORIES CA, COMPTES CO",
		                  "J.IDCOMPTE = CO.IDCOMPTE and J.IDCAT = CA.IDCAT and "+(user_id === null  ? "J.STATUT = 'public'" : "J.IDCOMPTE = "+user_id), function (error, result) {
				if (error) {
					callback(error);
				} else {
					callback(null, result);
				}
			});
	}

	connect_user(prenom, nom, passwd, callback) {
		let sha1 = crypto.createHash("sha1");
		sha1.update(passwd);
		let passwdHashed = sha1.digest("hex");

		this.modele.select("IDCOMPTE as id, PRENOMCOMPTE as prenom, NOMCOMPTE as nom",
			"COMPTES",
			"PRENOMCOMPTE = '"+prenom+"' and NOMCOMPTE = '"+nom+"' and PASSWORDCOMPTE = '"+passwdHashed+"'", function (error, results) {
				if (error) {
					callback(error);
				} else {
					callback(null, (results.length > 0 ? results[0] : false));
				}
			});
	}

	register(prenom, nom, passwd, callback) {
		this.modele.select("IDCOMPTE",
			"COMPTES",
			"PRENOMCOMPTE = '"+prenom+"' and NOMCOMPTE = '"+nom+"'", (error, results) => {
				if (error) {
					callback(error);
				} else {
					if (results.length > 0) {
						callback(null, "ALREADY EXIST");
					} else {
						let sha1 = crypto.createHash("sha1");
						sha1.update(passwd);
						let passwdHashed = sha1.digest("hex");
						this.modele.insert("COMPTES",
							[null, prenom, nom, passwdHashed], (error,result) => {
								if (error) {
									callback(error);
								} else {
									this.modele.select("IDCOMPTE as id",
										"COMPTES",
										"PRENOMCOMPTE = '"+prenom+"' and NOMCOMPTE = '"+nom+"'", (error,results) => {
											if (error) {
												callback(error);
											} else {
												if (results.length != 1) {
													callback(null, "Echec de la création du compte");
												} else {
													callback(null, {id: results[0].id});
												}
											}
										});
								}
							})
					}
				}
			});
	}

	supprJouet(idUser,idJouet,callback) {
		this.modele.delete("JOUETS",
			"IDJ = "+idJouet+" and IDCOMPTE = "+idUser, function (error) {
				if (error) {
					callback(error);
					return;
				}
				callback(null);
			});
	}

	listCat(callback) {
		this.modele.select("IDCAT as id, NOMC as nom","CATEGORIES","", function (error,results) {
			if (error) {
				callback(error);
				return
			}
			callback(null,results);
		});
	}

	addJouet(nom,description,statut,catId,imagePath,userId,callback) {
		this.modele.select("IDJ","JOUETS", "NOMJ = '"+nom+"'", (error, results) => {
			if (error) {
				callback(error);
				return;
			}
			if (results.length > 0) {
				callback(null,"Un jouet portant le même nom existe déjà");
				return;
			}
			this.modele.select("IDCAT","CATEGORIES", "IDCAT = "+catId, (error, results) => {
				if (error) {
					callback(error);
					return;
				}
				if (results.length == 0) {
					callback(null,"Cette catégorie n'existe pas");
					return;
				}
				this.modele.insert("JOUETS",
					[null, catId, nom, userId, description, statut], (error,result) => {
						if (error) {
							callback(error);
							return;
						}
						this.modele.select("IDJ","JOUETS", "NOMJ = '"+nom+"'", (error, results) => {
							if (error) {
								callback(error);
								return;
							}
							let idJ = results[0].IDJ;
							let code = shelljs.exec('mv '+imagePath+" "+__dirname+"/img/"+idJ+".jpg").code;
							if (code != 0) {
								callback(new Error("Echec de copie fichier "+imagePath+" => "+__dirname+"/img/"+idJ+".jpg"));
							} else {
								callback(null,true);
							}
						});
					})
			});
		});
	}

};