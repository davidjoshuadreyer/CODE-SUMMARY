/*
 * GenArrayStack.h
 *
 *  Created on: Dec 31, 2021
 *      Author: mao
 */


#ifndef ARRAY_STACK
#define ARRAY_STACK

#include <iostream>
#include "StackException.h"
using namespace std;


class StackFull : public RuntimeException {
public:
	StackFull(const string& err) : RuntimeException(err) {}
};


template <typename E>
class ArrayStack {
	enum { DEF_CAPACITY = 100 }; // default stack capacity
public:
	ArrayStack(int cap = DEF_CAPACITY); // constructor from capacity
	int size() const; // number of items in the stack
	bool isEmpty() const; // is the stack empty?
	const E& top() const; // get the top element
	void push(const E& e); // push element onto stack
	E pop(); // pop the stack
	// . . .housekeeping functions omitted
private: // member data
	E* S; // array of stack elements
	int capacity; // stack capacity
	int t; // index of the top of the stack
};

template <typename E> ArrayStack<E>::ArrayStack(int cap)
: S(new E[cap]), capacity(cap), t(-1) { } // constructor from capacity

template <typename E> int ArrayStack<E>::size() const
{ return (t + 1); } // number of items in the stack

template <typename E> bool ArrayStack<E>::isEmpty() const
{ return (t < 0); } // is the stack empty?

template <typename E> // return top of stack
const E& ArrayStack<E>::top() const {
	if (isEmpty()) throw StackEmpty("Top of empty stack");
	return S[t];
}

template <typename E> // push element onto the stack
void ArrayStack<E>::push(const E& e){
	if (size() == capacity) throw StackFull("Push to full stack");
	S[++t] = e;
}

template <typename E> // pop the stack
E ArrayStack<E>::pop(){
	if (isEmpty()) throw StackEmpty("Pop from empty stack");
	E el = S[t];
	--t;
	return el;
}

#endif
