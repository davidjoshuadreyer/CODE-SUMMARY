/*
 * ConstructorDestructorCallDemo.cpp
 *
 *  Created on: Nov 2, 2023
 *      Author: mao
 */


#include <iostream>
using namespace std;



class Person
{
public:    
    Person(){
        cout<< "Person Constructor" << endl;
    }
    
    ~Person(){
        cout<< "Person Destructor" << endl;
    }

};


class Employee : public Person
{
    
public:
    
    Employee(){
        cout<< "Employee Constructor" << endl;
    }
    
    Employee(string name){
        cout<< "Employee Constructor with Input" << endl;
    }
    
    ~Employee(){
        cout<< "Employee Destructor" << endl;
    }

};

class Faculty : public Employee
{
    
public:
    
    Faculty():Employee("Unknown") {
        cout<< "Faculty Constructor" << endl;
    }
    
    ~Faculty(){
        cout<< "Faculty Destructor" << endl;
    }

};

int ConstructorDestructorCallDemo()
{

    Faculty f;
    
    return 0;
}



