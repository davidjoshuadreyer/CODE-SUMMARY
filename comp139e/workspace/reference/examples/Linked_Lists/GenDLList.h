/*
 * GenDLList.h
 *
 *  Created on: Dec 30, 2021
 *      Author: mao
 */


//***************************** GenDLList.h ***************************
#ifndef DOUBLY_LINKED_LIST
#define DOUBLY_LINKED_LIST

template<class T>
class DLLNode {
public:
	DLLNode() {
		next = prev = nullptr;
	}
	DLLNode(const T& el, DLLNode *n = nullptr, DLLNode *p = nullptr) {
		info = el; next = n; prev = p;
	}
	T info;
	DLLNode *next, *prev;
};

template<class T>
class DoublyLinkedList {
public:
	DoublyLinkedList() {
		head = tail = nullptr;
	}
	void addToDLLTail(const T&);
	T deleteFromDLLTail();
protected:
	DLLNode<T> *head, *tail;
};

template<class T>
void DoublyLinkedList<T>::addToDLLTail(const T& el) {
	if (tail != nullptr) {
		tail = new DLLNode<T>(el,nullptr,tail);
		tail->prev->next = tail;
	}
	else head = tail = new DLLNode<T>(el);
}

template<class T>
T DoublyLinkedList<T>::deleteFromDLLTail() {
	T el = tail->info;
	if (head == tail) { // if only one node in the list;
		delete head;
		head = tail = nullptr;
	}
	else { // if more than one node in the list;
		tail = tail->prev;
		delete tail->next;
		tail->next = nullptr;
	}
	return el;
}
#endif
