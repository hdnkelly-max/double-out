// CAR-TABS, cases 7-12 of tests/s3-tabs.js (split so each CI test stays under 600 s). See that file for the cases.
// usage: node tests/s3-tabs-2.js [dir]
process.env.CASES = process.env.CASES || '7,8,9,10,11,12';
require('./s3-tabs.js');
