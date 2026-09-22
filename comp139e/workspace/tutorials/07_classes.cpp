/*
 * LESSON 7: Objects, private data, constructors, const, static, copy, destructor.
 * Prerequisite: 3-6. Run: main.exe tutorial 7
 * Expect: original area = 12; copy area = 24; array total = 14; live count ends at 0.
 * Try: change the copy's width and confirm the original stays the same.
 * Connects to the Objects_and_Classes references and Labs 5-6.
 */
#include "Tutorials.hpp"
#include <iostream>
using namespace std;

namespace tutorial07 {
class Tile {
private:
    double width;
    double height;
    static int liveCount; // One shared count for the entire class.
public:
    Tile(double newWidth = 1.0, double newHeight = 1.0)
        : width(newWidth), height(newHeight) // Initialize each object's own data.
    {
        liveCount++;
    }
    ~Tile() // Called when this object leaves its scope.
    {
        liveCount--;
    }
    double area() const // const promises not to change this object.
    {
        return width * height;
    }
    void setWidth(double newWidth)
    {
        if (newWidth > 0.0) width = newWidth;
    }
    static int getLiveCount() { return liveCount; }

    // A copy constructor creates a NEW object from an existing object.
    Tile(const Tile& other) : width(other.width), height(other.height)
    {
        liveCount++;
    }
    // Assignment changes an ALREADY existing object; it doesn't change the count.
    Tile& operator=(const Tile& other)
    {
        width = other.width;
        height = other.height;
        return *this; // this is a pointer to the object being assigned to.
    }
};
int Tile::liveCount = 0; // Define the shared variable once.
}

int tutorials::classes()
{
    {
        tutorial07::Tile original(3.0, 4.0);
        tutorial07::Tile copy = original;
        copy.setWidth(6.0);
        cout << "Original area = " << original.area() << endl;
        cout << "Copy area = " << copy.area() << endl;
        tutorial07::Tile assigned;
        assigned = original;
        cout << "Assigned area = " << assigned.area() << endl;

        tutorial07::Tile tiles[2] = {tutorial07::Tile(2.0, 3.0), tutorial07::Tile(2.0, 4.0)};
        double total = 0.0;
        for (int i = 0; i < 2; i++) total += tiles[i].area();
        cout << "Array total = " << total << endl;
        cout << "Live objects inside block = " << tutorial07::Tile::getLiveCount() << endl;
    } // Destructors run here, including for every object in the array.
    cout << "Live objects after block = " << tutorial07::Tile::getLiveCount() << endl;
    // This class contains only numbers. Owning a raw pointer needs extra copy care.
    return 0;
}
