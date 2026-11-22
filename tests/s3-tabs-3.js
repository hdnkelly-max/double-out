// CAR-TABS, cases 13-18 of tests/s3-tabs.js (split so each CI test stays under 600 s). See that file for the cases.
// usage: node tests/s3-tabs-3.js [dir]
process.env.CASES = process.env.CASES || '13,14,15,16,17,18';
require('./s3-tabs.js');
