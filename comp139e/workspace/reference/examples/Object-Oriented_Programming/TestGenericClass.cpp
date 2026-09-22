#include <iostream>
#include <string>
using namespace std;

template<typename T> 
class BuildingG {
public:
    T x;
    T y;
    string name;
    
    BuildingG() {
        x = 0;
        y = 0;
        name = "noname";
    }
    
    BuildingG(T x, T y, string name) : y(y), name(name) {
        this->x = x;
    }

    string getName();
};

template<typename T>
string BuildingG<T>::getName() {
    return name;
}

template<typename T>
class HouseG : public BuildingG<T> {
public:
    string owner;

    HouseG() : BuildingG<T>(3, 6, "cde") {
        owner = "abc";
    }

    string getOwner() {
        return owner;
    }
};

int TestGenericClass() {
    HouseG<double> h;
    cout << "BuildingG name: " << h.getName() << endl;
    cout << "Owner: " << h.getOwner() << endl;
    return 0;
}


