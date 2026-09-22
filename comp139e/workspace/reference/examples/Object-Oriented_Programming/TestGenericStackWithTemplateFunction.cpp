/*
 * TestGenericStackWithTemplateFunction.cpp
 *
 *  Created on: Feb 20, 2022
 *      Author: mao
 */

#include <iostream>
#include <string>
#include "GenericStack.h"
using namespace std;

template<typename T>
void printStack(Stack<T>& stack)
{
  while (!stack.empty())
    cout << stack.pop() << " ";
  cout << endl;
}

int testGenericStackWithTemplateFunction()
{
  // Create a stack of int values
  Stack<int> intStack;
  for (int i = 0; i < 10; i++)
    intStack.push(i);
  printStack(intStack);

  // Create a stack of strings
  Stack<string> stringStack;
  stringStack.push("Chicago");
  stringStack.push("Denver");
  stringStack.push("London");
  printStack(stringStack);

  return 0;
}


