module.exports=`<h1>Online Code Desk</h1>
<p class="lead">Edit, compile, and run C++ here. No workspace download or installation needed.</p>
<div class="actions"><button id="scratch" type="button">Open C++ scratchpad</button><a href="setup.html">Optional local setup</a></div>
<div class="desk-layout"><aside class="library">
<label for="search">Search programs and files</label><input id="search" type="search" placeholder="Pointers, Stack, Circle...">
<label for="category">Show</label><select id="category"><option value="all">All programs</option><option value="tutorials">Tutorials</option><option value="labs">Labs</option><option value="examples">Reference examples</option><option value="scratch">Scratchpad</option></select>
<p id="matches" role="status"></p><div id="programs"></div></aside>
<section class="desk-detail" aria-labelledby="program-title"><p id="program-kind" class="eyebrow"></p><h2 id="program-title">Loading Code Desk...</h2><p id="program-note"></p><p><a id="lesson-link" hidden>Read lesson</a></p>
<label for="file-select">Project file</label><select id="file-select" disabled></select>
<div class="editor-tools"><span id="source-status" role="status"></span><button id="copy-source" type="button" disabled>Copy</button><button id="reset" type="button" disabled>Reset file</button></div>
<label class="sr-only" for="source-code">Editable source code</label><textarea id="source-code" class="code-editor" rows="22" spellcheck="false" autocapitalize="off" autocomplete="off" wrap="off" disabled></textarea>
<p id="save-status" class="hint" role="status"></p>
<label for="stdin">Program input (stdin)</label><p id="input-hint" class="hint"></p><textarea id="stdin" rows="4" spellcheck="false" placeholder="Type all input values here before running"></textarea>
<p class="hint">Input is sent all at once, followed by EOF. Results appear when the program finishes. Each run starts with fresh data files; supported course file results appear below the output.</p>
<div class="actions"><button id="run" class="primary" type="button" disabled>Compile &amp; run</button><button id="stop" type="button" hidden>Stop waiting</button><button id="sample-input" type="button">Use example input</button></div>
<p class="hint">Run sends this program's source files and input to <a href="https://ce.judge0.com/" target="_blank" rel="noopener">Judge0</a> for compilation. Requires internet and compiler availability. C++ runs are limited to 5 seconds of CPU time.</p>
<p id="run-status" role="status" aria-live="polite">Loading...</p><h3>Program output</h3><pre id="console" tabindex="0" aria-label="Program output"></pre>
<details id="diagnostics-panel" hidden><summary>Compiler messages and errors</summary><pre id="diagnostics" tabindex="0"></pre></details>
</section></div><noscript><p>Enable JavaScript to use the online compiler, or <a href="review.html">read the lessons</a>.</p></noscript>`;
