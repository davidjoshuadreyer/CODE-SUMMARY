#pragma once
#include <stdexcept>

namespace tutorial11 {
// Read after lessons 5, 7, 9, and 10. All template definitions stay in this header.
template <typename T>
class LearningStack {
private:
    struct Node {
        T value;
        Node* next;
    };
    Node* head;
public:
    LearningStack() : head(nullptr) {}
    bool empty() const { return head == nullptr; }
    void push(T value)
    {
        head = new Node{value, head};
    }
    T top() const
    {
        if (empty()) throw std::runtime_error("Stack is empty");
        return head->value; // Look without removing.
    }
    void pop()
    {
        if (empty()) throw std::runtime_error("Stack is empty");
        Node* oldHead = head;
        head = head->next;
        delete oldHead;
    }
    ~LearningStack()
    {
        while (!empty()) pop(); // Release any remaining nodes.
    }
    // A default copy would share nodes and delete them twice. Disable copying
    // until you learn to copy each node into a separate list (a deep copy).
    LearningStack(const LearningStack&) = delete;
    LearningStack& operator=(const LearningStack&) = delete;
};
}
