#!/usr/bin/env node

const fs = require('fs');
const ncp = require('ncp').ncp;

const destBootstrapCss = "./src/public/css/bootstrap.css";
const destBootstrapJs = "./src/public/js/bootstrap.js";
const destJqueryJs = "./src/public/js/jquery.js";

const prodBootstrapCss = "./node_modules/bootstrap/dist/css/bootstrap.min.css";
const prodBootstrapJs = "./node_modules/bootstrap/dist/js/bootstrap.min.js";
const prodJqueryJs = "./node_modules/jquery/dist/jquery.min.js";

const devBootstrapCss = "./node_modules/bootstrap/dist/css/bootstrap.css";
const devBootstrapJs = "./node_modules/bootstrap/dist/js/bootstrap.js";
const devJqueryJs = "./node_modules/jquery/dist/jquery.js";

// function to copy file or folder using "ncp"
function copy(source, destination) {
  ncp(source, destination, (err) => {
    if (err) throw err;
    console.log(source, "->", destination);
  });
}

if (process.argv.slice(2) == "") {
  console.error("argument must either be \"dev\" or \"prod\"");
  process.exit(1);
}

// create the folders where files will be copied
fs.mkdir("./src/public/css", (err) => {
  // don't give a shit about the error
});
fs.mkdir("./src/public/js", (err) => {
  // don't give a shit about the error
});

// copy material icons folder
copy("./node_modules/material-icons/iconfont/", "./src/public/material-icons/");

if (process.argv.slice(2) == "dev") {
  copy(devBootstrapCss, destBootstrapCss);
  copy(devBootstrapJs, destBootstrapJs);
  copy(devJqueryJs, destJqueryJs);
  console.log("copying files in dev mode");
}

if (process.argv.slice(2) == "prod") {
  copy(prodBootstrapCss, destBootstrapCss);
  copy(prodBootstrapJs, destBootstrapJs);
  copy(prodJqueryJs, destJqueryJs);
  copy("./src/public/", "./build/public/");
  copy("./src/views/", "./build/views/");
  console.log("copying files in prod mode");
}
