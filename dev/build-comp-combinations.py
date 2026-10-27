"""Core exam combinations. No STL containers in implementations."""
import json
from pathlib import Path
out=[]
for kind in ['Stack','Queue','List']:
 for storage in ['linked','array']:
  for typed in ['template','int']:
   T='T' if typed=='template' else 'int'
   prefix='template <typename T>\n' if typed=='template' else ''
   code='#include <iostream>\n#include <string>\n#include <stdexcept>\nusing namespace std;\n\n'
   code+=prefix+'class '+kind+' {\nprivate:\n'
   if storage=='linked':
    code+=f'    struct Node {{\n        {T} item;\n        Node* next;\n        Node({T} value, Node* link = nullptr) : item(value), next(link) {{}}\n    }};\n    Node* head;\n'
    if kind!='Stack': code+='    Node* tail;\n'
    code+='public:\n    '+kind+'() : head(nullptr)'+(', tail(nullptr)' if kind!='Stack' else '')+' {}\n'
    code+=f'    // This object owns its nodes. Disable shallow copying.\n    {kind}(const {kind}&) = delete;\n    {kind}& operator=(const {kind}&) = delete;\n'
    code+=f'    ~{kind}() {{\n        while (head != nullptr) {{\n            Node* old = head;\n            head = head->next;\n            delete old;\n        }}\n    }}\n    bool isEmpty() const {{ return head == nullptr; }}\n'
    if kind=='Stack':
     code+=f'    void push({T} item) {{ head = new Node(item, head); }}\n    {T} top() const {{\n        if (isEmpty()) throw runtime_error("Empty stack");\n        return head->item;\n    }}\n'
    else:
     add='enqueue' if kind=='Queue' else 'addToTail'
     code+=f'    void {add}({T} item) {{\n        Node* node = new Node(item);\n        if (isEmpty()) head = node;\n        else tail->next = node;\n        tail = node;\n    }}\n'
     if kind=='List': code+=f'    void addToHead({T} item) {{\n        head = new Node(item, head);\n        if (tail == nullptr) tail = head;\n    }}\n'
     else: code+=f'    {T} front() const {{\n        if (isEmpty()) throw runtime_error("Empty queue");\n        return head->item;\n    }}\n'
    remove={'Stack':'pop','Queue':'dequeue','List':'deleteFromHead'}[kind]
    code+=f'    {T} {remove}() {{\n        if (isEmpty()) throw runtime_error("Empty {kind.lower()}");\n        Node* old = head;\n        {T} value = old->item;\n        head = head->next;\n'
    if kind!='Stack':code+='        if (head == nullptr) tail = nullptr;\n'
    code+='        delete old;\n        return value;\n    }\n'
    if kind=='List': code+='    int size() const {\n        int count = 0;\n        for (Node* p = head; p != nullptr; p = p->next) ++count;\n        return count;\n    }\n'
   else:
    code+=f'    static const int capacity = 4; // EDIT: maximum number of items.\n    {T} data[capacity];\n    int count;\n'
    if kind=='Queue':code+='    int first;\n'
    code+='public:\n    '+kind+'() : count(0)'+(', first(0)' if kind=='Queue' else '')+' {}\n    bool isEmpty() const { return count == 0; }\n    bool isFull() const { return count == capacity; }\n'
    if kind=='Stack':code+=f'    void push({T} item) {{\n        if (isFull()) throw runtime_error("Full stack");\n        data[count++] = item;\n    }}\n    {T} top() const {{\n        if (isEmpty()) throw runtime_error("Empty stack");\n        return data[count - 1];\n    }}\n    {T} pop() {{\n        if (isEmpty()) throw runtime_error("Empty stack");\n        return data[--count];\n    }}\n'
    if kind=='Queue':code+=f'    void enqueue({T} item) {{\n        if (isFull()) throw runtime_error("Full queue");\n        data[(first + count) % capacity] = item;\n        ++count;\n    }}\n    {T} front() const {{\n        if (isEmpty()) throw runtime_error("Empty queue");\n        return data[first];\n    }}\n    {T} dequeue() {{\n        if (isEmpty()) throw runtime_error("Empty queue");\n        {T} value = data[first];\n        first = (first + 1) % capacity;\n        --count;\n        return value;\n    }}\n'
    if kind=='List':code+=f'    int size() const {{ return count; }}\n    void insert(int index, {T} item) {{\n        if (index < 0 || index > count) throw runtime_error("Invalid index");\n        if (isFull()) throw runtime_error("Full list");\n        for (int i = count; i > index; --i) data[i] = data[i - 1];\n        data[index] = item;\n        ++count;\n    }}\n    {T} remove(int index) {{\n        if (index < 0 || index >= count) throw runtime_error("Invalid index");\n        {T} value = data[index];\n        for (int i = index; i + 1 < count; ++i) data[i] = data[i + 1];\n        --count;\n        return value;\n    }}\n'
   code+='};\n'
   add={'Stack':'push','Queue':'enqueue','List':'addToTail'}[kind]
   rem={'Stack':'pop()','Queue':'dequeue()','List':'deleteFromHead()'}[kind]
   if kind=='List' and storage=='array':add='insert';rem='remove(0)'
   for case in ['generic','numbers','records' if typed=='template' else 'reuse']:
    records=case=='records'
    c=code+('\nstruct Job {\n    int id = 0;\n    string name;\n};\n' if records else '')
    instance=kind+('<Job>' if records else '<int>' if typed=='template' else '')
    use=f'{instance} values;\n'
    nums=['{10, "First"}','{20, "Second"}','{30, "Third"}'] if records else ['10','20','30']
    for i,value in enumerate(nums):use+=f'values.{add}('+ (f'{i}, ' if add=='insert' else '')+value+');\n'
    use+='while (!values.isEmpty()) {\n'
    use+=f'    '+('Job item' if records else 'int item')+f' = values.{rem};\n'
    use+='    cout << '+('item.id << ": " << item.name' if records else 'item')+' << "\\n";\n}\n'
    if case=='reuse':use+=f'values.{add}('+('0, ' if add=='insert' else '')+f'40);\ncout << values.{rem} << "\\n";\n'
    if case=='generic':use='// EDIT: replace int, values, and test items to match your question.\n'+use
    base=f'{kind.lower()}-{storage}-{typed}'
    expected=('30\n20\n10\n' if kind=='Stack' else '10\n20\n30\n')
    if records:expected=('30: Third\n20: Second\n10: First\n' if kind=='Stack' else '10: First\n20: Second\n30: Third\n')
    if case=='reuse':expected+='40\n'
    out.append(dict(id='combo-'+base+'-'+case,group='combinations',title={'generic':'Generic','numbers':'Numbers','records':'Jobs','reuse':'Empty → reuse'}[case],when={'generic':'Minimal implementation. Rename the class and fields to fit your question.','numbers':'Insert three numbers and remove them in order.','records':'Store records with an ID and a name.','reuse':'Remove every item, then insert and remove one more.'}[case],code=c,use=use,test='',parts=[['Storage','Linked nodes allocate one node per item; removal deletes that node.' if storage=='linked' else 'Fixed array capacity is 4. Queue indices wrap with modulo; list insert/remove shifts items.'],['Type','T is chosen by the caller. Array versions require a default-constructible, assignable T.' if typed=='template' else 'The item type is int. Replace all item types consistently if required.']],change='Change class and item names, add the fields and operations required by the question. '+('Array capacity is an editable constant.' if storage=='array' else 'Keep the empty-list pointer updates and node cleanup.'),watch='Check empty, one item, reuse after empty'+(', full capacity and wraparound.' if storage=='array' else '. Node ownership means copying is disabled.'),reference='code-templates.html#lab-guide',expected=expected.strip().replace('\n',' · '),expectedOutput=expected,facets={'structure':kind.lower(),'storage':storage,'type':typed,'role':'generic' if case=='generic' else 'example'},shortTitle={'generic':'Generic','numbers':'Numbers','records':'Jobs','reuse':'Empty → reuse'}[case]))
Path(__file__).resolve().parent.parent.joinpath('comp139e/combination-patterns.json').write_text(json.dumps(out,indent=2)+'\n')
print('Built',len(out),'combination examples')
