#!/usr/bin/env node

// eslint-disable-next-line @typescript-eslint/no-var-requires
const main = require('./index.js');
(async () => {
  await main()
})().catch(err => { console.error(err) })
