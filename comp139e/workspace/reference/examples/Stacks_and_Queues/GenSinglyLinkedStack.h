/*
 * GenLinkedStack.h
 *
 *  Created on: Dec 31, 2021
 *      Author: mao
 */

#ifndef SINGLY_LINKED_STACK
#define SINGLY_LINKED_STACK

#include "StackException.h"
#include "../Linked_Lists/GenSLList.h"
using namespace std;

//typedef string Elem; // stack element type
template <typename E>
class SLinkedStack { // stack as a linked list

public:
	SLinkedStack(); // constructor
	int size() const; // number of items in the stack
	bool isEmpty() const; // is the stack empty?
	const E& top() const; // the top element
	void push(const E& e); // push element onto stack
	E pop(); // pop the stack
private: // member data
	SLinkedList<E> S; // linked list of elements
	int n; // number of elements
};

template <typename E>
SLinkedStack<E>::SLinkedStack()
: S(), n(0) { } // constructor

template <typename E>
int SLinkedStack<E>::size() const
{ return n; } // number of items in the stack

template <typename E>
bool SLinkedStack<E>::isEmpty() const
{ return n == 0; } // is the stack empty?

// get the top element
template <typename E>
const E& SLinkedStack<E>::top() const {
	if (isEmpty()) throw StackEmpty("Top of empty stack");
	return S.front();
}
// push an element into the stack
template <typename E>
void SLinkedStack<E>::push(const E& e) { // push element onto stack
	++n;
	S.addFront(e);
}

// pop the stack
template <typename E>
E SLinkedStack<E>::pop() {
	if (isEmpty()) throw StackEmpty("Pop from empty stack");
	--n;
	E el = S.front();
	S.removeFront();
	return el;
}


#endif /* SINGLY_LINKED_STACK */
