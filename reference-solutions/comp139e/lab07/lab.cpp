#include "lab.hpp"
#include "../common/shapes/Circle.hpp"
#include "../common/shapes/Rectangle.hpp"
#include <iostream>
#include <vector>
#include <stdexcept>
int lab07::run(){
    Circle circle(2,0,0);Rectangle rectangle(3,4,1,1),extra(6,7,2,2);
    std::vector<Shape*> shapes; // Non-owning pointers to objects in this scope.
    try{
        shapes.push_back(&circle);shapes.push_back(&rectangle);
        shapes[0]->moveTo(2,3);shapes.front()->draw();shapes.back()->draw();
        std::cout<<"size="<<shapes.size()<<" capacity="<<shapes.capacity()<<" max="<<shapes.max_size()<<'\n';
        shapes.insert(shapes.begin()+1,&extra);
        for(auto it=shapes.begin();it!=shapes.end();++it)(*it)->draw();
        shapes.pop_back();shapes.at(0)->draw();
        shapes.at(shapes.size()); // Deliberate bounds error, unlike unchecked [].
    }catch(const std::out_of_range& e){std::cout<<"Caught out_of_range: "<<e.what()<<'\n';}
    return 0;
}
