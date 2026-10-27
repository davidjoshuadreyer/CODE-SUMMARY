"""Small game-themed C++ applications for the unified study reference."""
import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
prior={x['id']:x for x in json.loads((ROOT/'comp139e/exam-drills.json').read_text())}
items=[]
inc='#include <iostream>\n#include <string>\n#include <stdexcept>\nusing namespace std;\n\n'
def add(slug,title,kind,q,code,use,out,watch,checks=''):
 items.append(dict(id='game-'+slug,group='game-examples',title=title,shortTitle=title,when=q[0],question=q,code=code,use=use,expected=out.strip(),expectedOutput=out,manualComments=True,
 parts=[['Structure',{'inheritance':'Base class holds shared data; derived classes add behavior.','stack':'Last added is first removed.','queue':'First added is first removed.','list':'Nodes store data and link to the next node.'}[kind]],['main()','Creates sample game data and calls the required operation.']],change='Rename the game objects, change the sample values, and adapt the requested operation.',watch=watch,reference='workspace/reference/course/labs/139E - Lab 6.html',referenceLabel='Related lab: classes and linked structures',sourceNote='Game-themed application of course structures.',facets=dict(structure=kind,storage='none' if kind=='inheritance' else 'linked',type='template' if 'template <' in code else 'int',role='example'),typeLabel='template' if 'template <' in code else 'non-template',checks=checks))
add('warrior','Player · warrior damage','inheritance',['Derive Warrior from Player; calculate attack damage.','Player stores protected name and level and declares pure virtual int attack() const. Warrior adds strength; attack() returns strength + 2 * level. Give Player a virtual destructor.'],inc+'''class Player {
protected:
    string name;
    int level;
public:
    Player(string n, int l) : name(n), level(l) {}
    virtual int attack() const = 0;
    virtual ~Player() = default;
};
class Warrior : public Player {
    int strength;
public:
    Warrior(string n, int l, int s) : Player(n, l), strength(s) {}
    int attack() const override { return strength + 2 * level; }
};''','Warrior hero("Ari", 3, 10);\nPlayer& player = hero; // Calls the Warrior override.\ncout << player.attack() << \'\\n\';','16\n','Initialize inherited fields through Player(n, l).','Warrior w("A",0,4); Player& p=w; assert(p.attack()==4);')
add('mage','Player · mage mana','inheritance',['Derive Mage; spend mana only when a spell can be cast.','Player stores a name. Mage starts with mana and exposes cast(cost) and getMana(). cast returns false for a negative cost or insufficient mana; otherwise subtract the cost and return true.'],inc+'''class Player {
    string name;
public:
    Player(string n) : name(n) {}
    string getName() const { return name; }
};
class Mage : public Player {
    int mana;
public:
    Mage(string n, int m) : Player(n), mana(m) {}
    bool cast(int cost) {
        if (cost < 0 || cost > mana) return false;
        mana -= cost; // Change state only after checking the cost.
        return true;
    }
    int getMana() const { return mana; }
};''','Mage mage("Mira", 20);\ncout << mage.cast(8) << \' \' << mage.getMana() << \'\\n\';\ncout << mage.cast(15) << \' \' << mage.getMana() << \'\\n\';','1 12\n0 12\n','The constructor assumes nonnegative starting mana.','Mage m("M",5); assert(!m.cast(-1) && m.getMana()==5); assert(m.cast(5) && m.getMana()==0); assert(!m.cast(1));')
add('healer','Player · healing limit','inheritance',['Derive Healer; restore health without exceeding maximum health.','Player stores protected health and maxHealth. Healer::heal(amount) ignores negative amounts, adds the amount, and caps health at maxHealth.'],inc+'''class Player {
protected:
    int health, maxHealth;
public:
    Player(int h, int maximum) : health(h), maxHealth(maximum) {}
    int getHealth() const { return health; }
};
class Healer : public Player {
public:
    Healer(int h, int maximum) : Player(h, maximum) {}
    void heal(int amount) {
        if (amount < 0) return;
        health += amount;
        if (health > maxHealth) health = maxHealth;
    }
};''','Healer player(70, 100);\nplayer.heal(50);\ncout << player.getHealth() << \'\\n\';','100\n','Starting health should be between zero and maxHealth.','Healer h(50,100); h.heal(-2); assert(h.getHealth()==50); h.heal(10); assert(h.getHealth()==60); h.heal(100); assert(h.getHealth()==100);')
add('tank','Player · armour reduces damage','inheritance',['Override takeDamage() for an armoured player.','Player has virtual takeDamage(amount), which subtracts nonnegative damage and keeps health at least zero. Tank reduces incoming damage by armour, then calls the base method.'],inc+'''class Player {
    int health;
public:
    Player(int h) : health(h) {}
    virtual void takeDamage(int amount) {
        if (amount < 0) amount = 0;
        health -= amount;
        if (health < 0) health = 0;
    }
    int getHealth() const { return health; }
    virtual ~Player() = default;
};
class Tank : public Player {
    int armour;
public:
    Tank(int h, int a) : Player(h), armour(a) {}
    void takeDamage(int amount) override {
        Player::takeDamage(amount - armour); // Reuse the health checks.
    }
};''','Tank tank(100, 5);\nPlayer& player = tank;\nplayer.takeDamage(12);\ncout << player.getHealth() << \'\\n\';','93\n','Use Player::takeDamage to call the base version, not the override again. Assume armour is nonnegative.','Tank t(10,5); t.takeDamage(2); assert(t.getHealth()==10); t.takeDamage(50); assert(t.getHealth()==0);')
add('weapons','Weapons · sword and bow','inheritance',['Give Sword and Bow different damage formulas.','Weapon declares pure virtual int damage() const and a virtual destructor. Sword returns strength * 2; Bow returns accuracy + 5. Call both through Weapon pointers.'],inc+'''class Weapon {
public:
    virtual int damage() const = 0;
    virtual ~Weapon() = default;
};
class Sword : public Weapon {
    int strength;
public:
    Sword(int s) : strength(s) {}
    int damage() const override { return strength * 2; }
};
class Bow : public Weapon {
    int accuracy;
public:
    Bow(int a) : accuracy(a) {}
    int damage() const override { return accuracy + 5; }
};''','Sword sword(6);\nBow bow(4);\nWeapon* weapons[] = {&sword, &bow};\nfor (Weapon* weapon : weapons) cout << weapon->damage() << \' \';\ncout << \'\\n\';','12 9 \n','The pointers refer to local objects; do not delete them.')
add('enemies','Enemies · different rewards','inheritance',['Use an abstract Enemy for Goblin and Dragon rewards.','Enemy stores protected level and has pure virtual int reward() const. Goblin returns level * 10; Dragon returns level * 100. Provide a virtual destructor.'],inc+'''class Enemy {
protected:
    int level;
public:
    Enemy(int l) : level(l) {}
    virtual int reward() const = 0;
    virtual ~Enemy() = default;
};
class Goblin : public Enemy {
public:
    Goblin(int l) : Enemy(l) {}
    int reward() const override { return level * 10; }
};
class Dragon : public Enemy {
public:
    Dragon(int l) : Enemy(l) {}
    int reward() const override { return level * 100; }
};''','Goblin goblin(2);\nDragon dragon(3);\nEnemy* enemies[] = {&goblin, &dragon};\nint gold = 0;\nfor (Enemy* enemy : enemies) gold += enemy->reward();\ncout << gold << \'\\n\';','320\n','Keep Enemy pointers to preserve each derived reward calculation.')
add('boss','Boss · three-level inheritance','inheritance',['Build Character → Enemy → Boss.','Character stores protected health. Enemy adds protected damage. Boss adds bonusDamage and provides attack() returning damage + bonusDamage. Expose getHealth() in Character.'],inc+'''class Character {
protected:
    int health;
public:
    Character(int h) : health(h) {}
    int getHealth() const { return health; }
};
class Enemy : public Character {
protected:
    int damage;
public:
    Enemy(int h, int d) : Character(h), damage(d) {}
};
class Boss : public Enemy {
    int bonusDamage;
public:
    Boss(int h, int d, int bonus) : Enemy(h, d), bonusDamage(bonus) {}
    int attack() const { return damage + bonusDamage; }
};''','Boss boss(200, 20, 10);\ncout << boss.getHealth() << \' \' << boss.attack() << \'\\n\';','200 30\n','Each constructor initializes only its immediate base.')
add('items','Items · potion and coin','inheritance',['Use Potion and Coin through an Item interface.','Item declares virtual void use() const = 0 and a virtual destructor. Potion stores a healing amount; Coin stores a gold amount. use() prints the effect without changing any player.'],inc+'''class Item {
public:
    virtual void use() const = 0;
    virtual ~Item() = default;
};
class Potion : public Item {
    int amount;
public:
    Potion(int a) : amount(a) {}
    void use() const override { cout << "Heal " << amount << '\\n'; }
};
class Coin : public Item {
    int amount;
public:
    Coin(int a) : amount(a) {}
    void use() const override { cout << "Gold " << amount << '\\n'; }
};''','Potion potion(25);\nCoin coin(10);\nItem* items[] = {&potion, &coin};\nfor (Item* item : items) item->use();','Heal 25\nGold 10\n','A void method performs an action; it does not return a number.')
add('movement','Player · define movement outside class','inheritance',['Derive Player from Entity; define move() below the class.','Entity stores protected x and y and provides printPosition(). Player declares move(dx, dy); define Player::move outside the class to add the offsets.'],inc+'''class Entity {
protected:
    int x, y;
public:
    Entity(int startX, int startY) : x(startX), y(startY) {}
    void printPosition() const { cout << x << ' ' << y << '\\n'; }
};
class Player : public Entity {
public:
    Player(int startX, int startY) : Entity(startX, startY) {}
    void move(int dx, int dy); // Declare inside the class.
};
void Player::move(int dx, int dy) { // Define using ClassName::.
    x += dx;
    y += dy;
}''','Player player(2, 3);\nplayer.move(4, -1);\nplayer.printPosition();','6 2\n','The definition must have the same parameter types as the declaration.')
add('profile','Player · extend profile printing','inheritance',['Print the base player name and the derived character class.','Player stores a private name and has virtual print(). Knight adds a rank and overrides print(), calling Player::print() before printing the rank.'],inc+'''class Player {
    string name;
public:
    Player(string n) : name(n) {}
    virtual void print() const { cout << name; }
    virtual ~Player() = default;
};
class Knight : public Player {
    string rank;
public:
    Knight(string n, string r) : Player(n), rank(r) {}
    void print() const override {
        Player::print(); // Reuse base printing for private data.
        cout << " - " << rank << '\\n';
    }
};''','Knight knight("Ari", "Captain");\nPlayer& player = knight;\nplayer.print();','Ari - Captain\n','Qualify the base call to avoid recursively calling Knight::print().')
stack=prior['exam-stack-basic']['code']
queue=prior['exam-queue-basic']['code']
add('undo','Stack · undo a move','stack',['Undo the latest player position using a stack.','Store each old Position before moving. undo(history, position) restores the latest saved position and returns true; return false if history is empty.'],stack+'''\nstruct Position { int x; int y; };
bool undo(Stack<Position>& history, Position& player) {
    if (history.isEmpty()) return false;
    player = history.pop(); // Latest saved position comes out first.
    return true;
}''','Position player{0, 0};\nStack<Position> history;\nhistory.push(player); player = {3, 2};\nhistory.push(player); player = {5, 4};\nundo(history, player);\ncout << player.x << \' \' << player.y << \'\\n\';','3 2\n','Pass the player position by reference so undo changes the caller.','Stack<Position> s; Position p{1,2}; assert(!undo(s,p)); assert(p.x==1 && p.y==2); s.push({3,4}); assert(undo(s,p) && p.x==3 && p.y==4 && s.isEmpty());')
add('checkpoints','Stack · return to a checkpoint','stack',['Save checkpoint names and return to the most recent one.','Write respawn(checkpoints): pop the newest checkpoint, or return "Start" when empty.'],stack+'''\nstring respawn(Stack<string>& checkpoints) {
    if (checkpoints.isEmpty()) return "Start";
    return checkpoints.pop(); // Removes the checkpoint used by this respawn.
}''','Stack<string> checkpoints;\ncheckpoints.push("Village"); checkpoints.push("Castle");\ncout << respawn(checkpoints) << \'\\n\';\ncout << respawn(checkpoints) << \'\\n\';\ncout << respawn(checkpoints) << \'\\n\';','Castle\nVillage\nStart\n','Use pop() here because this question consumes the checkpoint.','Stack<string> s; assert(respawn(s)=="Start"); s.push("Cave"); assert(respawn(s)=="Cave" && s.isEmpty());')
add('loot','Stack · total loot value','stack',['Total stacked loot values without changing their order.','Use one temporary stack and only public operations. Return zero for empty loot.'],stack+'''\nint totalLoot(Stack<int>& loot) {
    int total = 0;
    Stack<int> temporary;
    while (!loot.isEmpty()) {
        int value = loot.pop();
        total += value;
        temporary.push(value);
    }
    // Second reversal restores the original loot stack.
    while (!temporary.isEmpty()) loot.push(temporary.pop());
    return total;
}''','Stack<int> loot;\nloot.push(10); loot.push(25); loot.push(5);\ncout << totalLoot(loot) << \' \' << loot.top() << \'\\n\';','40 5\n','Do not return until every item has been restored.','Stack<int> s; assert(totalLoot(s)==0); s.push(2); s.push(3); assert(totalLoot(s)==5); assert(s.pop()==3 && s.pop()==2);')
add('combo','Stack · resolve latest action first','stack',['Store action records and resolve the newest first.','Action contains a name and damage. resolve(actions) pops all actions and returns total damage.'],stack+'''\nstruct Action { string name; int damage; };
int resolve(Stack<Action>& actions) {
    int total = 0;
    while (!actions.isEmpty()) {
        Action action = actions.pop(); // Copy the record before its node is deleted.
        cout << action.name << '\\n';
        total += action.damage;
    }
    return total;
}''','Stack<Action> actions;\nactions.push({"Slash", 5}); actions.push({"Fire", 8});\nint damage = resolve(actions);\ncout << damage << \'\\n\';','Fire\nSlash\n13\n','This function consumes the stack; the newest action runs first.','Stack<Action> s; assert(resolve(s)==0); s.push({"Hit",4}); ostringstream output; streambuf* old=cout.rdbuf(output.rdbuf()); int total=resolve(s); cout.rdbuf(old); assert(total==4 && s.isEmpty() && output.str()=="Hit\\n");')
add('turns','Queue · take turns','queue',['Move the current player to the back after their turn.','nextTurn(turns) returns the front name and enqueues it again. Return "None" if empty.'],queue+'''\nstring nextTurn(Queue<string>& turns) {
    if (turns.isEmpty()) return "None";
    string player = turns.dequeue();
    turns.enqueue(player); // Player waits at the back for the next round.
    return player;
}''','Queue<string> turns;\nturns.enqueue("Ari"); turns.enqueue("Mira");\ncout << nextTurn(turns) << \'\\n\';\ncout << nextTurn(turns) << \'\\n\';\ncout << nextTurn(turns) << \'\\n\';','Ari\nMira\nAri\n','One turn rotates one player; it does not empty the queue.','Queue<string> q; assert(nextTurn(q)=="None"); q.enqueue("A"); assert(nextTurn(q)=="A" && q.size()==1); q.enqueue("B"); assert(nextTurn(q)=="A" && nextTurn(q)=="B");')
add('spawn','Queue · spawn enemies in order','queue',['Spawn enemies in the order they were scheduled.','Spawn contains type and health. spawnNext(queue) removes and prints one record; return false if empty, true otherwise.'],queue+'''\nstruct Spawn { string type; int health; };
bool spawnNext(Queue<Spawn>& pending) {
    if (pending.isEmpty()) return false;
    Spawn enemy = pending.dequeue(); // Oldest scheduled enemy is first.
    cout << enemy.type << ' ' << enemy.health << '\\n';
    return true;
}''','Queue<Spawn> pending;\npending.enqueue({"Goblin", 20}); pending.enqueue({"Dragon", 100});\nwhile (spawnNext(pending)) {}','Goblin 20\nDragon 100\n','Check empty before dequeue().','Queue<Spawn> q; assert(!spawnNext(q)); q.enqueue({"Slime",5}); ostringstream output; streambuf* old=cout.rdbuf(output.rdbuf()); bool ok=spawnNext(q); cout.rdbuf(old); assert(ok && q.isEmpty() && output.str()=="Slime 5\\n");')
add('matchmaking','Queue · pair waiting players','queue',['Take the first two waiting players to create a match.','makeMatch(queue) prints their names and returns true. If fewer than two wait, return false without removing anyone.'],queue+'''\nbool makeMatch(Queue<string>& waiting) {
    if (waiting.size() < 2) return false; // Check BEFORE removing either player.
    string first = waiting.dequeue();
    string second = waiting.dequeue();
    cout << first << " vs " << second << '\\n';
    return true;
}''','Queue<string> waiting;\nwaiting.enqueue("Ari"); waiting.enqueue("Mira"); waiting.enqueue("Kai");\nmakeMatch(waiting);\ncout << waiting.front() << \'\\n\';','Ari vs Mira\nKai\n','Checking size first prevents losing a lone waiting player.','Queue<string> q; assert(!makeMatch(q)); q.enqueue("A"); assert(!makeMatch(q) && q.size()==1); q.enqueue("B"); ostringstream output; streambuf* old=cout.rdbuf(output.rdbuf()); bool ok=makeMatch(q); cout.rdbuf(old); assert(ok && q.isEmpty() && output.str()=="A vs B\\n");')
listbase=inc+'''// Each node stores an item name and quantity.
struct ItemNode {
    string name;
    int quantity;
    ItemNode* next;
    ItemNode(string n, int q, ItemNode* link = nullptr)
        : name(n), quantity(q), next(link) {}
};
class Inventory {
    ItemNode* head;
public:
    Inventory() : head(nullptr) {}
    Inventory(const Inventory&) = delete;
    Inventory& operator=(const Inventory&) = delete;
    ~Inventory() {
        while (head != nullptr) {
            ItemNode* old = head;
            head = head->next; // Save the rest of the chain before deletion.
            delete old;
        }
    }
    void add(string name, int quantity) {
        head = new ItemNode(name, quantity, head); // Insert at the front.
    }
'''
add('inventory-find','List · find inventory quantity','list',['Find how many of an item the inventory contains.','Assume item names are unique. Add quantityOf(name) const; return zero when the item is missing.'],listbase+'''    int quantityOf(string name) const {
        for (ItemNode* p = head; p != nullptr; p = p->next)
            if (p->name == name) return p->quantity;
        return 0;
    }
};''','Inventory bag;\nbag.add("Potion", 3); bag.add("Key", 1);\ncout << bag.quantityOf("Potion") << \' \' << bag.quantityOf("Arrow") << \'\\n\';','3 0\n','Traverse with p, leaving head unchanged.','Inventory b; assert(b.quantityOf("Key")==0); b.add("Key",2); b.add("Potion",3); assert(b.quantityOf("Key")==2 && b.quantityOf("Potion")==3);')
add('inventory-use','List · use one inventory item','list',['Use one item if its quantity is positive.','Assume unique item names. useOne(name) reduces its quantity by one and returns true. Return false if missing or already zero; leave zero-quantity nodes in the list.'],listbase+'''    bool useOne(string name) {
        for (ItemNode* p = head; p != nullptr; p = p->next) {
            if (p->name == name && p->quantity > 0) {
                --p->quantity; // Change the data; keep the links unchanged.
                return true;
            }
        }
        return false;
    }
};''','Inventory bag;\nbag.add("Potion", 1);\ncout << bag.useOne("Potion") << \' \' << bag.useOne("Potion") << \'\\n\';','1 0\n','A quantity of zero is a valid stored item; do not decrement below zero.','Inventory b; assert(!b.useOne("Key")); b.add("Key",0); assert(!b.useOne("Key")); b.add("Potion",2); assert(b.useOne("Potion")); assert(b.useOne("Potion")); assert(!b.useOne("Potion"));')
add('inventory-remove','List · remove an inventory item','list',['Remove the first inventory node with a matching name.','remove(name) must handle the head, middle, last node and missing items. Return true if removed, false otherwise.'],listbase+'''    bool remove(string name) {
        ItemNode* previous = nullptr;
        ItemNode* current = head;
        while (current != nullptr && current->name != name) {
            previous = current;
            current = current->next;
        }
        if (current == nullptr) return false;
        if (previous == nullptr) head = current->next; // Removing the first node.
        else previous->next = current->next; // Skip the removed node.
        delete current;
        return true;
    }
    void print() const {
        for (ItemNode* p = head; p != nullptr; p = p->next) cout << p->name << ' ';
        cout << '\\n';
    }
};''','Inventory bag;\nbag.add("Key", 1); bag.add("Potion", 3); bag.add("Sword", 1);\nbag.remove("Potion");\nbag.print();','Sword Key \n','Relink the chain before deleting; never read current after delete.','Inventory b; assert(!b.remove("X")); b.add("A",1); b.add("B",1); b.add("C",1); assert(b.remove("B")); assert(b.remove("C")); assert(b.remove("A")); assert(!b.remove("A")); b.add("D",1); assert(b.remove("D"));')
assert len(items)==20
assert sum(x['facets']['structure']=='inheritance' for x in items)==10
(ROOT/'comp139e/game-examples.json').write_text(json.dumps(items,indent=2)+'\n')
print('Generated 20 game examples.')
