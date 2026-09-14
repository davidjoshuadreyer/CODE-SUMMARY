
#include <stdio.h>
#include <stdlib.h>

/*
 * 
 */

struct player 
{
    int age;
    int level;
    //char *name;
    
    // char *pointer = "name1";
    // char array[100] = "name2";
    
    char name[100];
};

struct player printStruct(struct player s) 
{
    printf("Player 2: %s : Age: %d Level: %d\n", s.name, s.age, s.level);
    s.level = 4;
    printf("Player 2: %s : Age: %d Level: %d\n", s.name, s.age, s.level);
    return s;
}


struct player printStructpointer(struct player *p) 
{
    printf("Player 3: %s : Age: %d Level: %d\n", p->name, p->age, p->level);
    p->level = 6;
    printf("Player 3: %s : Age: %d Level: %d\n", p->name, p->age, p->level);

}


int main(int argc, char** argv) {

//    struct player p1;
//    
//    p1.name = "David";
//    p1.age = 26;
//    p1.level = 1;
//    
//    printf("Player 1: %s : Age: %d Level: %d\n", p1.name, p1.age, p1.level);
//    
    struct player p2 = {2, 5, "abc"};
    
    printStruct(p2);
    
    
    struct player *p3;
    p3 = &p2;
    //printStruct(p3);
    //printf("Player 3: %s : Age: %d Level: %d\n", (*p3).name, (*p3).age, (*p3).level);
    //printf("Player 3: %s : Age: %d Level: %d\n", p3->name, p3->age, p3->level);
    printStructpointer(p3);
    return (EXIT_SUCCESS);
}

