#include "lab.hpp"
#include "Stack.hpp"
#include "Square.hpp"
#include "../common/shapes/Circle.hpp"
#include <iostream>
int lab06::run(){
    Circle circle(2,0,0);Rectangle rectangle(3,4,1,1);Square square(5,2,2);
    Stack<Shape*> stack; // Shapes outlive the stack; it owns only its linked nodes.
    try {
        stack.push(&circle);stack.push(&rectangle);stack.push(&square);
        std::cout<<"Size: "<<stack.size()<<"; top: "<<*stack.top()<<'\n';
        while(!stack.isEmpty()) stack.pop()->draw();
        stack.pop(); // Deliberately demonstrate the empty-stack exception.
    }catch(const StackException& e){std::cout<<"Caught: "<<e.what()<<'\n';}
    return 0;
}
