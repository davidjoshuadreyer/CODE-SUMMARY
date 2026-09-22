/*
 * StackException.h
 *
 *  Created on: Dec 31, 2021
 *      Author: mao
 */

#ifndef STACK_EXCEPTION
#define STACK_EXCEPTION

#include <string>
using namespace std;

class RuntimeException { // generic run-time exception
private:
	string errorMsg;
public:
	RuntimeException(const string& err) { errorMsg = err; }
	string getMessage() const { return errorMsg; }
};


class StackEmpty : public RuntimeException {
public:
	StackEmpty(const string& err) : RuntimeException(err) {}
};



#endif /* STACK_EXCEPTION */
