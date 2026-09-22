/*
 * TestIntSLList.cpp
 *
 *  Created on: Dec 30, 2021
 *      Author: mao
 */



#include <iostream>
#include "IntSLList.h"
using namespace std;

int testIntSLList()
{
	IntSLList *SSlist = new IntSLList();

	// bool isempty = false;

	cout<< "Checking whether the initial list is empty: " << SSlist->isEmpty()<< endl;

	SSlist->addToHead(10);
	SSlist->addToTail(8);
	SSlist->addToTail(50);

	cout<< "Checking whether 10 is in the list before calling deleteFromHead(): " << SSlist->isInList(10) << endl;
	SSlist->deleteFromHead();
	cout<< "Checking whether 10 is in the list after calling deleteFromHead(): " << SSlist->isInList(10) << endl;


	return 0;
}
