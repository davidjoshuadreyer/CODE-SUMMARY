/*
 * IntSLList.h
 *
 *  Created on: Dec 30, 2021
 *      Author: mao
 */

//************************ IntSLList.h **************************
// singly-linked list class to store integers
#ifndef INT_LINKED_LIST
#define INT_LINKED_LIST

class IntSLLNode {
public:
	IntSLLNode() {
		info = 0;
		next = nullptr;
	}
	IntSLLNode(int el, IntSLLNode *ptr = nullptr) {
		info = el; next = ptr;
	}
	int info;
	IntSLLNode *next;
};

class IntSLList {
public:
	IntSLList() {
		head = tail = nullptr;
	}
	~IntSLList();
	int isEmpty() {
		return head == nullptr;
	}
	void addToHead(int);
	void addToTail(int);
	int deleteFromHead(); // delete the head and return its info;
	int deleteFromTail(); // delete the tail and return its info;
	void deleteNode(int);
	bool isInList(int) const;

private:
	IntSLLNode *head, *tail;
};
#endif

