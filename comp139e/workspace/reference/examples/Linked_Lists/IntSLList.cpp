/*
 * IntSLList.cpp
 *
 *  Created on: Dec 30, 2021
 *      Author: mao
 */

//************************ IntSLList.cpp **************************
#include <iostream>
#include "./IntSLList.h"

IntSLList::~IntSLList() {
	for (IntSLLNode *p; !isEmpty(); ) {
		p = head->next;
		delete head;
		head = p;
	}
}
void IntSLList::addToHead(int el) {
	head = new IntSLLNode(el,head);
	if (tail == nullptr)
		tail = head;
}
void IntSLList::addToTail(int el) {
	if (tail != nullptr) { // if list not empty;
		tail->next = new IntSLLNode(el);
		tail = tail->next;
	}
	else head = tail = new IntSLLNode(el);
}
int IntSLList::deleteFromHead() {
	int el = head->info;
	IntSLLNode *tmp = head;
	if (head == tail) // if only one node in the list;
		head = tail = nullptr;
	else head = head->next;
	delete tmp;
	return el;
}
int IntSLList::deleteFromTail() {
	int el = tail->info;
	if (head == tail) { // if only one node in the list;

		delete head;
		head = tail = nullptr;
	}
	else { // if more than one node in the list,
		IntSLLNode *tmp; // find the predecessor of tail;
		for (tmp = head; tmp->next != tail; tmp = tmp->next);
		delete tail;
		tail = tmp; // the predecessor of tail becomes tail;
		tail->next = nullptr;
	}
	return el;
}
void IntSLList::deleteNode(int el) {
	if (head != nullptr) { // if nonempty list;
		if (head == tail && el == head->info) { // if only one
			delete head; // node in the list;
			head = tail = nullptr;
		}
		else if (el == head->info) {// if more than one node in the list
			IntSLLNode *tmp = head;
			head = head->next;
			delete tmp; // and old head is deleted;
		}
		else { // if more than one node in the list
			IntSLLNode *pred, *tmp;
			for (pred = head, tmp = head->next; // and a nonhead node
					tmp != nullptr && !(tmp->info == el);// is deleted;
					pred = pred->next, tmp = tmp->next);
			if (tmp != nullptr) {
				pred->next = tmp->next;
				if (tmp == tail)
					tail = pred;
				delete tmp;
			}
		}
	}
}
bool IntSLList::isInList(int el) const {
	IntSLLNode *tmp;
	for (tmp = head; tmp != nullptr && !(tmp->info == el); tmp = tmp->next);
	return tmp != nullptr;
}



