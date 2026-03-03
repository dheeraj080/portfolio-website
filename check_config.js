const path = require('path');
require('ts-node').register(); // if using ts-node
const config = require('./next.config.ts').default;
console.dir(config, { depth: null });
