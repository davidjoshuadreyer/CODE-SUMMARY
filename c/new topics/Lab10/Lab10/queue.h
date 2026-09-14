/* Header file for a simple queue data structure.
 * To be implemented using dynamic allocation.
 *
 * Dale Shpak June 23, 2015, March 24, 2023
 */

#ifndef QUEUE_H
#define	QUEUE_H
#include <stdio.h>

// The following 3 lines must all be in agreement
typedef int ItemType;
#define ITEM_PROMPT "an integer"
#define ITEM_FORMAT "%d"

// A node for a singly-linked list
typedef struct listNode {
    struct listNode *next;
    void *dataPtr;
} ListNode;

// A queue data structure
typedef struct {
    ListNode *front;
    ListNode *rear;
    int size; // Number of items currently in the queue
} Queue;

// enqueue and dequeue use void pointers so that they are
// completely generic, i.e., they store a pointer to anything.

/* Add an item to the rear of the dynamically-allocated queue.
 * Returns:  pointer to the item if successful, NULL if not */
void *enqueue (Queue *queuePtr, void *newItem);

/* Removes an item from the front of the queue.
 * Returns:  pointer to the item if successful, NULL if empty */
void *dequeue (Queue *queuePtr);

/* Returns:  number of items in the queue */
int queueSize (const Queue queue);

/* Print the contents of the queue to the specified stream
 * Note that this "extra" function is the only one that
 * uses ItemType
 */
void printQueue (const Queue queue, FILE *stream);

#endif	/* QUEUE_H */

