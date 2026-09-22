(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.CppGuide=api;})(globalThis,()=>{
 'use strict';
 const escape=s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const types=new Set('int double float char bool void string auto long short unsigned signed size_t vector array queue stack deque list ifstream ofstream fstream ostream istream'.split(' '));
 const keywords=new Set('if else for while do switch case break continue return const constexpr using namespace class struct public private protected virtual override new delete try catch throw template typename static nullptr true false enum typedef sizeof default this'.split(' '));
 // A lexical reading aid, not a C++ parser. Preserve every source character.
 function tokens(source){
  const pattern=/\/\*[\s\S]*?(?:\*\/|(?![\s\S]))|\/\/[^\n]*|R"([^\s()\\]{0,16})\([\s\S]*?\)\1"|"(?:\\[\s\S]|[^"\\])*"|'(?:\\[\s\S]|[^'\\])*'|^\s*#[^\n]*|\b(?:0x[\da-fA-F]+|\d+(?:\.\d*)?(?:[eE][+-]?\d+)?[uUlLfF]*)\b|\b[A-Za-z_]\w*\b|<<|>>|==|!=|<=|>=|&&|\|\||[+*/%=!<>&|^~?:-]/gm;
  const result=[];let end=0;
  for(const m of source.matchAll(pattern)){
   if(m.index>end)result.push({text:source.slice(end,m.index),kind:''});
   const text=m[0];let kind='';
   if(text.startsWith('//')||text.startsWith('/*'))kind='comment';
   else if(/^\s*#/.test(text))kind='include';
   else if(/^(?:R"|["'])/.test(text))kind='string';
   else if(/^\d/.test(text))kind='number';
   else if(types.has(text))kind='type';
   else if(keywords.has(text))kind='keyword';
   else if(['cout','cin','cerr','endl','getline'].includes(text))kind='io';
   else if(/^[A-Za-z_]/.test(text)&&/^\s*\(/.test(source.slice(m.index+text.length)))kind='function';
   else if(/^[^\w\s]+$/.test(text))kind='operator';
   result.push({text,kind});end=m.index+text.length;
  }
  if(end<source.length)result.push({text:source.slice(end),kind:''});return result;
 }
 const labels={comment:'Comment: a note for people, not an instruction to run.',include:'Preprocessor instruction: prepare this file before compiling.',type:'Type: describes what kind of value or object is used.',string:'Literal text or a character: the quoted value is data.',number:'A number written directly in the code.',keyword:'A C++ keyword: a word with a special role in the language.',io:'Input or output: read values or display them.',function:'Function name: a named set of instructions.',operator:'Operator: performs an operation or forms an expression. Its meaning depends on context.'};
 function highlight(source){return tokens(source).map(t=>t.kind?`<span class="cpp-${t.kind}" title="${labels[t.kind]}">${escape(t.text)}</span>`:escape(t.text)).join('');}
 const lessons=[
  ['Variables are named storage boxes.','int holds whole numbers; double holds numbers with a decimal part. cout displays a result.','Change one starting number, predict the result, then run it.'],
  ['Input lets your program ask for a value.','cin reads the input you type. An if statement chooses which instructions to follow.','Try an input on each side of the comparison. Does the message change?'],
  ['A function is a reusable set of instructions.','Arguments are the values you give it. return sends a result back to the caller.','Change a value passed to a function and predict the returned result.'],
  ['An array holds several values under one name.','An index selects a position. The first position is 0, not 1. A string holds text.','Find an index such as [0]. Change a value at that position and run again.'],
  ['A pointer holds the location of another value.','& asks for an address. In a pointer expression, * follows that address to the stored value. new[] allocates an array; delete[] releases it.','Change one array value. Notice which printed result changes.'],
  ['A header describes functions; a .cpp file contains their instructions.','The compiler builds the source files and links them together. A test compares a result with what you expected.','Open Geometry.cpp using Project file. Change a formula and watch which test fails, then reset that file.'],
  ['A class describes a kind of object.','An object groups data with functions that work on that data. private hides details; public exposes the parts you can use.','Find where an object is created. Change a starting value and compare its output.'],
  ['Inheritance lets one class build on another.','A derived class can provide its own version of a virtual function. The object determines which version runs.','Find a derived class and change the message in its function.'],
  ['A template is a recipe that works with different types.','Instead of writing nearly identical functions for int and double, a type parameter lets one definition serve both.','Compare calls using whole numbers and decimal numbers.'],
  ['A linked list connects small objects called nodes.','Each node stores a value and a pointer to another node. nullptr means there is no next node.','Draw the nodes as boxes and the pointers as arrows before running.'],
  ['Stacks and queues control which item comes out next.','A stack takes the newest item first. A queue takes the oldest item first.','Predict the removal order before running the example.'],
  ['File streams read or write text in a file.','ifstream reads; ofstream writes. These are different from cin and cout, which use the input and output boxes.','Edit tutorials/data/mixed.txt, run, then read the file report below the program output.'],
  ['Exceptions report a problem to code that can handle it.','throw signals the problem. A matching catch block handles it. try marks the code being watched.','Try a value that triggers the error path, then a value that succeeds.'],
  ['A vector is a list that can grow.','push_back adds an item at the end. size tells you how many items it contains.','Add an item and predict the new size.'],
  ['A controller adjusts a system toward a target.','The program repeats small time steps: measure the difference, calculate a correction, update the system.','Change one gain and compare the printed response.'],
  ['The program models an object moving back and forth.','Variables describe the physical system; the formulas calculate how its motion changes over time.','Change one physical parameter and compare the calculated motion.'],
  ['Numerical integration estimates an area using samples.','The program divides an interval into pieces, evaluates a function, and combines the results.','Change the number of intervals. For Simpson\'s rule, keep it positive and even.'],
  ['A program can use a class defined in another file.','The header declares CircleX. CricleX.cpp supplies its functions; both are needed to build the program.','Change circle.r and predict whether the area gets bigger or smaller.']
 ];
 function overview(id){
  if(id==='scratch')return ['Your first program: display a message.','C++ starts at main(). The instructions inside its braces run in order, unless a loop, branch, or function call changes the flow.','Change the text inside the quotation marks, then select Compile & run.'];
  if(id?.startsWith('tutorial:'))return lessons[Number(id.split(':')[1])-1];
  return ['Read one small piece at a time.','Find the function being called, then follow its statements. Some course files use an entry point in online_main.cpp instead of defining main() themselves.','Look for TODO comments in lab starters. These mark parts you are meant to complete. Start with Lesson 1 if this example feels unfamiliar.'];
 }
 function explain(source,lineNumber){
  const lines=source.split('\n'),raw=lines[lineNumber]||'';
  // Mask comments and literal contents before looking for operations.
  const masked=tokens(source).map(t=>['comment','string'].includes(t.kind)?t.text.replace(/[^\n]/g,' '):t.text).join('').split('\n')[lineNumber]?.trim()||'';
  if(!raw.trim())return 'A blank line gives your eyes a break. It does not run an instruction.';
  if(!masked)return 'This is a note or part of a text literal. Comments explain the code to people; text in quotation marks is data used by the program.';
  if(/^#\s*include/.test(masked))return 'Bring in declarations from a header so this file can use them. <iostream> provides standard input and output, including cin and cout.';
  if(/^#/.test(masked))return 'This is an instruction for the preprocessor, which prepares the file before the C++ compiler reads it. Header guards help avoid repeated declarations.';
  if(/\bmain\s*\(/.test(masked))return 'main is the starting function of a C++ program. Its braces enclose the instructions to run. Other course files may be called from online_main.cpp.';
  if(/\b(cout|cerr)\b/.test(masked))return 'Send values to the output. cout is normal output; cerr is for error messages. Here, << sends the next value to that stream. Text in quotes prints as text; a variable prints its value.';
  if(/\b(cin|getline)\b/.test(masked))return 'Read input. cin >> reads a value; getline reads a line of text. Enter the values in Program input before you run. Match the order the program asks for them.';
  if(/\belse\b/.test(masked))return 'This is an alternative path when the earlier if condition is false. An else if checks another condition first.';
  if(/\bif\s*\(/.test(masked))return 'Make a choice. Check the condition in parentheses; run the following statement or block only when it is true. == compares values; = assigns a value.';
  if(/\bfor\s*\(/.test(masked))return 'Repeat instructions in a loop. A counting for loop has a starting value, a condition to keep going, and an update. A range-based for loop visits items in a collection.';
  if(/\bwhile\s*\(/.test(masked))return 'Keep repeating while the condition is true. Check which value changes so the loop can eventually stop. A do/while loop checks after each pass.';
  if(/\breturn\b/.test(masked))return 'Finish this function now. If a value follows return, send it back to the caller. Returning 0 from main normally means the program completed successfully.';
  if(/\bdelete\b/.test(masked))return 'Release memory previously allocated with new. Use delete[] for an array allocated with new[]. Do not use that memory afterward.';
  if(/\bnew\b/.test(masked))return 'Allocate memory for an object or array and get its address. A raw owning pointer needs matching cleanup; modern C++ often uses containers or smart pointers for this.';
  if(/\bthrow\b/.test(masked))return 'Signal a problem by throwing an exception. Execution jumps to a matching catch handler if one exists. A TODO exception in a lab means that starter code still needs implementation.';
  if(/\bcatch\b/.test(masked))return 'Handle a matching exception thrown inside the preceding try block. Read the handler to see what the program does about the problem.';
  if(/\btry\b/.test(masked))return 'Begin a block whose exceptions can be handled by the catch blocks that follow.';
  if(/\b(class|struct)\b/.test(masked))return 'Describe a type of object: the data it holds and the functions it offers. Creating an object later gives you an instance of this type.';
  if(/^(public|private|protected)\s*:/.test(masked))return 'Set who can access the following class members. public is available to users of the class; private is for the class itself; protected also permits derived classes.';
  if(/\busing\s+namespace/.test(masked))return 'Allow names from this namespace to be used without their prefix. For example, cout can stand for std::cout after using namespace std.';
  if(/^\s*[{}];?\s*$/.test(masked))return masked.startsWith('{')?'Open a block: the instructions or declarations inside belong together.':'Close a block. Match this brace with its opening brace to see what belongs inside.';
  if(/\b(int|double|float|bool|char|string|auto)\b/.test(masked)&&!masked.includes('('))return 'This line likely declares a variable: a named place to store a value. int stores whole numbers, double stores decimal values, bool stores true or false, and string stores text. An = supplies or changes a value.';
  if(/\w\s*\(/.test(masked))return 'Parentheses often mark a function call, definition, or declaration. In a call, values inside are arguments given to that function. Find its definition to learn exactly what it does.';
  if(/(?:^|[^=!<>])=(?!=)/.test(masked))return 'An assignment stores a value. Work out the expression on the right, then store the result on the left. +=, -= and similar forms update the old value.';
  return 'Read this with the surrounding lines. A semicolon usually ends a statement; braces group code; parentheses group expressions or function arguments. This guide is a reading aid, not a debugger.';
 }
 return {tokens,highlight,overview,explain};
});
