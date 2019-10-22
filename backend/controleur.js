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
		this.modele.select("J.IDJ as id, CO.IDCOMPTE as idUser, J.NOMJ as nomj, CA.NOMC as cat, CA.IDCAT as catId, CO.PRENOMCOMPTE as prenom, CO.NOMCOMPTE as nom, J.DESCRIPTION as description, J.STATUT as statut",
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
							});
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
					});
			});
		});
	}

	userList(callback) {
		this.modele.select("IDCOMPTE as id, PRENOMCOMPTE as prenom, NOMCOMPTE as nom","COMPTES","", function (error,results) {
			if (error) {
				callback(error);
				return;
			}
			callback(null,results);
		});
	}

	modifJouet(idUser,idJouet,nom,description,statut,catId,callback) {
		this.modele.select("IDJ","JOUETS","IDJ = "+idJouet+" and IDCOMPTE = "+idUser, (error,results) => {
			if (error) {
				callback(error);
				return;
			}
			if (results.length === 0) {
				callback(null,"Jouet non trouuvé ou il ne vous appartient pas");
				return;
			}
			this.modele.update("JOUETS", {NOMJ: nom, DESCRIPTION: description, STATUT: statut, IDCAT: catId},
				"IDJ = "+idJouet+" and IDCOMPTE = "+idUser, (error) => {
					if (error) {
						callback(error);
						return;
					}
					callback(null,true);
				});
		});
	}

	demmandTroc(idUserSrc,idJouetSrc,idUserDst,idJouetDst,callback) {
		this.modele.select("IDTROC","DEMANDETROC",
			"IDCOMPTESRC = "+idUserSrc+" and IDJSRC = "+idJouetSrc+" and IDCOMPTEDST = "+idUserDst+" and IDJDST = "+idJouetDst, (error,results) => {
				if (error) {
					callback(error);
					return;
				}
				if (results.length > 0) {
					callback(null,"Cette demande de troc a déjà été envoyée");
					return;
				}
				this.modele.select("IDJ","JOUETS",
					"(IDJ = "+idJouetSrc+" and IDCOMPTE = "+idUserSrc+") or (IDJ = "+idJouetDst+" and IDCOMPTE = "+idUserDst+")", (error,results) => {
						if (error) {
							callback(error);
							return;
						}
						if (results.length < 2) {
							callback(null,"Les jouets indiqués dans la requête ne correspondent pas aux propriétaires associés");
							return;
						}
						this.modele.insert("DEMANDETROC", [null,idUserSrc,idJouetSrc,idUserDst,idJouetDst], (error) => {
							if (error) {
								callback(error);
								return;
							}
							callback(null,true);
						});
					});
			});
	}

	getDemandTroc(idUser,callback) {
		this.modele.select("D.IDTROC as id, J.NOMJ as jouetSrc, CO.PRENOMCOMPTE as prenomSrc, CO.NOMCOMPTE as nomSrc",
							"DEMANDETROC D, COMPTES CO, JOUETS J","D.IDJSRC = J.IDJ and D.IDCOMPTESRC = CO.IDCOMPTE and D.IDCOMPTEDST = "+idUser+" ORDER BY D.IDTROC", (error,results) => {
				if (error) {
					callback(error);
					return;
				}
				this.modele.select("J.NOMJ as jouetDst","DEMANDETROC D, JOUETS J","D.IDJDST = J.IDJ and D.IDCOMPTEDST = "+idUser+" ORDER BY D.IDTROC", (error,resultsb) => {
					if (error) {
						callback(error);
						return;
					}
					if (results.length !== resultsb.length) {
						callback(null,"Erreur de cohérence dans la récupération des données");
						return;
					}
					let demandes = [];
					for (let i=0;i<results.length;i++) {
						demandes.push({id: results[i].id, jouetSrc: results[i].jouetSrc, prenomSrc: results[i].prenomSrc, nomSrc: results[i].nomSrc, jouetDst: resultsb[i].jouetDst});
					}
					callback(null,demandes);
				});
			});
	}

	refusDemandeTroc(idUser,idTroc,callback) {
		this.modele.delete("DEMANDETROC","IDTROC = "+idTroc+" and IDCOMPTEDST = "+idUser, function (error) {
			if (error) {
				callback(error);
				return;
			}
			callback(null,true);
		});
	}

	acceptDemandeTroc(idUser,idTroc,callback) {
		this.modele.select("D.IDCOMPTESRC as idUserSrc, D.IDJSRC as idJouetSrc, D.IDCOMPTEDST as idUserDst, D.IDJDST as idJouetDst, CO.PRENOMCOMPTE as prenomDst, CO.NOMCOMPTE as nomDst",
			"DEMANDETROC D, COMPTES CO", "D.IDTROC = "+idTroc+" and D.IDCOMPTEDST = CO.IDCOMPTE and D.IDCOMPTEDST = "+idUser, (error,results) => {
				if (error) {
					callback(error);
					return;
				}
				if (results.length === 0) {
					callback(null,"Demande introuvable ou bien elle ne vous est pas destinée");
					return;
				}

				let demande = results[0];
				this.modele.update("JOUETS",{IDCOMPTE: demande.idUserDst},"IDJ = "+demande.idJouetSrc, (error) => {
					if (error) {
						callback(error);
						return;
					}
					this.modele.update("JOUETS",{IDCOMPTE: demande.idUserSrc},"IDJ = "+demande.idJouetDst, (error) => {
						if (error) {
							callback(error);
							return;
						}
						this.modele.delete("DEMANDETROC",
							"IDJSRC = "+demande.idJouetSrc+" or IDJSRC = "+demande.idJouetDst+" or IDJDST = "+demande.idJouetSrc+" or IDJDST = "+demande.idJouetDst, (error) => {
								if (error) {
									callback(error);
									return;
								}
								this.modele.insert("NOTIFICATIONS",[null, demande.prenomDst+" "+demande.nomDst+" a accepté(e) votre demande de troc", demande.idUserSrc], (error) => {
									if (error) {
										callback(error);
										return;
									}
									callback(null,true);
								});
							});
					});
				});
			});
	}

	listNotification(idUser,callback) {
		this.modele.select("IDNOT as id, CONTENT as content","NOTIFICATIONS","IDCOMPTE = "+idUser, function (error,results) {
			if (error) {
				callback(error);
				return;
			}
			callback(null,results);
		});
	}

	supprNotification(idUser,idNotif,callback) {
		this.modele.delete("NOTIFICATIONS","IDNOT = "+idNotif+" and IDCOMPTE = "+idUser, function (error) {
			if (error) {
				callback(error);
				return;
			}
			callback(null);
		});
	}
};