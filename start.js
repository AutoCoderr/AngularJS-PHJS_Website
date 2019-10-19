const PHjs = require("./PHjs");

const options = {};

const libs = {util: require("util")};

PHjs("/home/julien/projects/angularTroc/backend","http",9001,options,libs,"/home/julien/projects/angularTroc/access.log","/home/julien/projects/angularTroc/error.log","/home/julien/projects/angularTroc/config.txt");
