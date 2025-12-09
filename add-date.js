const fs = require("fs");
const file = "package.json";

const pkg = JSON.parse(fs.readFileSync(file));

const version = process.argv[2];
pkg.version = version;

fs.writeFileSync(file, JSON.stringify(pkg, null, 2));

console.log("Package.json version updated:", version);
