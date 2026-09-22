/*
 * GenListStack.h
 *
 *  Created on: Dec 31, 2021
 *      Author: mao
 */

//********************** genListStack.h *************************
// generic stack defined as a doubly linked list
//List in C++ Standard Template Library (STL)


#ifndef LIST_STACK
#define LIST_STACK

#include <list>
using namespace std;

template<class T>
class ListStack {
public:
	ListStack() {
	}
	void clear() {
		lst.clear();
	}
	bool isEmpty() const {
		return lst.empty();

	}
	T& top() {
		return lst.back();
	}
	T pop() {
		T el = lst.back();
		lst.pop_back();
		return el;
	}
	void push(const T& el) {
		lst.push_back(el);
	}
private:
	std::list<T> lst;
};
#endif
