// shared headless setup: real fonts (Google Fonts is blocked here, so serve local copies) and no Supabase
const fs=require('fs');const CSS=fs.readFileSync('/home/claude/fonts/fonts_inline.css','utf8');
module.exports=async function(p){await p.route(/fonts\.googleapis\.com/,r=>r.fulfill({status:200,contentType:'text/css',body:CSS}));await p.route(/jsdelivr|supabase\.co|gstatic/,r=>r.abort());};
