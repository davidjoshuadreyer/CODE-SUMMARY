const fs = require('fs');
const katex = require('katex');
const { marked } = require('marked');

const BASE = 'C:/Users/david/OneDrive/Documents/CODE/CODE SUMMARY/chem';
let md = fs.readFileSync(BASE + '/Gravimetric_Lab_Report.md', 'utf8');
const katexCSS = fs.readFileSync('./node_modules/katex/dist/katex.min.css', 'utf8');

function renderDisplay(text) {
  return text.replace(/\$\$([\s\S]+?)\$\$/g, (_, inner) => {
    try {
      return katex.renderToString(inner.trim(), { displayMode: true, throwOnError: false });
    } catch (e) { return inner; }
  });
}

function renderInline(text) {
  return text.replace(/(?<!\$)\$(?!\$)([^$\n]+?)(?<!\$)\$(?!\$)/g, (_, inner) => {
    try {
      return katex.renderToString(inner.trim(), { displayMode: false, throwOnError: false });
    } catch (e) { return inner; }
  });
}

md = renderDisplay(md);
md = renderInline(md);

const renderer = new marked.Renderer();
marked.setOptions({ renderer, gfm: true, breaks: false });
let body = marked.parse(md);

// Page break before Introduction
body = body.replace(/<h2>Introduction<\/h2>/, '<h2 class="page-break">Introduction</h2>');

const css = `
@page{margin:0.85in 0.9in;size:letter}
body{font-family:Georgia,serif;max-width:820px;margin:0 auto;padding:32px 44px;font-size:11pt;line-height:1.65;color:#111}
h1{font-size:17pt;margin-bottom:4px}
h2{font-size:13pt;border-bottom:1px solid #aaa;padding-bottom:4px;margin-top:28px;margin-bottom:14px;page-break-after:avoid;break-after:avoid}
h2.page-break{page-break-before:always;break-before:always;margin-top:0}
h3{font-size:11.5pt;margin-top:20px;margin-bottom:6px;page-break-after:avoid;break-after:avoid}
table{border-collapse:collapse;width:100%;margin:14px 0;font-size:9.5pt;page-break-inside:avoid;break-inside:avoid}
th,td{border:1px solid #bbb;padding:5px 8px}
th{background:#f0f0f0}
td{text-align:center}
p{margin:8px 0;orphans:3;widows:3}
hr{display:none}
ol,ul{margin:6px 0;padding-left:24px}
.katex-display{margin:14px 0;overflow:visible;page-break-inside:avoid;break-inside:avoid}
.katex-display > .katex{text-align:center;overflow:visible}
.katex-display > .katex > .katex-html{overflow:visible;white-space:normal}
`;

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Lab 9 - Gravimetric Analysis of Chloride</title>
<style>
${katexCSS}
${css}
</style>
</head>
<body>
${body}
</body>
</html>`;

fs.writeFileSync(BASE + '/Gravimetric_Lab_Report.html', html, 'utf8');
console.log('HTML written, size:', html.length, 'bytes');
