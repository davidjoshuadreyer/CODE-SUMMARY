#pragma once
#include "StackException.hpp"
// Owns nodes, not any objects pointed to by T. Copying disabled to prevent double deletion.
template<class T> class Stack {
    struct Node { T item; Node* next; };
    Node* head=nullptr;int count=0;
public:
    Stack()=default;
    Stack(const Stack&)=delete;Stack& operator=(const Stack&)=delete;
    ~Stack(){while(head){Node* old=head;head=head->next;delete old;}}
    void push(T item){head=new Node{item,head};++count;}
    T pop(){if(isEmpty())throw StackException("pop from empty stack");
        T item=head->item;Node* old=head;head=head->next;delete old;--count;return item;}
    T top() const {if(isEmpty())throw StackException("top of empty stack");return head->item;}
    int size() const {return count;}bool isEmpty() const {return count==0;}
};
