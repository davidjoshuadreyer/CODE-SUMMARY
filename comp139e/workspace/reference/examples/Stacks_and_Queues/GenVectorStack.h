/*
 * GenVectorStack.h
 *
 *  Created on: Dec 31, 2021
 *      Author: mao
 */

//********************* GenStack.h *************************
// generic class for vector implementation of stack
// Vector in C++ Standard Template Library (STL)


#ifndef VECTOR_STACK
#define VECTOR_STACK

#include <vector> //
using namespace std;

template<class T, int capacity = 30>
class VectorStack {
public:
	VectorStack() {
		pool.reserve(capacity);
	}
	void clear() {
		pool.clear();
	}
	bool isEmpty() const {
		return pool.empty();
	}
	T& top() {
		return pool.back();
	}
	T pop() {
		T el = pool.back();
		pool.pop_back();
		return el;
	}
	void push(const T& el) {
		pool.push_back(el);
	}
private:
	vector<T> pool;
};
#endif
