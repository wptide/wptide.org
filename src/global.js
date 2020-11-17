const fs = require('fs');
const path = require('path');

const envPath = fs.existsSync(path.join(__dirname, '..', '.env')) ? path.join(__dirname, '..') : __dirname;
require('dotenv-flow').config({ path: envPath });
