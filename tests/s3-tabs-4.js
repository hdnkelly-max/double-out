// CAR-TABS R10, cases 21-26 of tests/s3-tabs.js (the cloud with guard v3: p_base on every write, refusals, the base_guarded flag). See that file.
// usage: node tests/s3-tabs-4.js [dir]
process.env.CASES = process.env.CASES || '21,22,23,24,25,26';
require('./s3-tabs.js');
