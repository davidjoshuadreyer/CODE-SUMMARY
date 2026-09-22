/*
 * LESSON 10: Nodes and singly/doubly linked lists.
 * Prerequisite: 5-7. Run: main.exe tutorial 10
 * Expect: forward = 10 20 30; backward = 2 1.
 * Try: prepend a fourth node. Draw the pointers on paper first.
 * Connects to Lab 6 and reference/examples/Linked_Lists.
 */
#include "Tutorials.hpp"
#include <iostream>
using namespace std;

namespace tutorial10 {
struct Node {
    int value;
    Node* next; // A node points to the next node of the same type.
};
struct DoubleNode {
    int value;
    DoubleNode* next;
    DoubleNode* previous;
};
}

int tutorials::linkedLists()
{
    tutorial10::Node* head = nullptr;
    // Prepending reverses insertion order: new node -> old head.
    head = new tutorial10::Node{30, head};
    head = new tutorial10::Node{20, head};
    head = new tutorial10::Node{10, head};
    tutorial10::Node* current = head;
    cout << "Forward = ";
    while (current != nullptr)
    {
        cout << current->value << " ";
        current = current->next;
    }
    cout << endl;

    while (head != nullptr)
    {
        tutorial10::Node* oldHead = head;
        head = head->next; // Save the next link BEFORE deleting the node.
        delete oldHead;
    }

    // Two local nodes are enough to illustrate backward links.
    tutorial10::DoubleNode first{1, nullptr, nullptr};
    tutorial10::DoubleNode second{2, nullptr, &first};
    first.next = &second;
    tutorial10::DoubleNode* cursor = &second;
    cout << "Backward = ";
    while (cursor != nullptr)
    {
        cout << cursor->value << " ";
        cursor = cursor->previous;
    }
    cout << endl;
    return 0;
}
