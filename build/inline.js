const fs = require('fs');

let mod = '';
if (process.argv[2]) mod = '.' + process.argv[2];
let html = fs
  .readFileSync(__dirname + '/../dist/index' + mod + '.html')
  .toString();
const js = fs.readFileSync(__dirname + '/../dist/bundle' + mod + '.js').toString();
/* const combinedBuffer =
  Buffer.concat([
    Buffer.from(html.slice(0, html.indexOf(' src=bundle.js')) + '>'),
    js.slice(2),
    Buffer.from('</script></html>')
  ]); */
html =
  html.slice(0, html.indexOf(' src=bundle.js')) +
  '>' +
  js +
  '</script></html>';
fs.writeFileSync(__dirname + '/../dist/gdqviewports.html', html);
