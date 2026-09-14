#include <stdio.h>
#include <stdlib.h>
#include "queue.h"

// Add an item to the rear of the queue.
// Returns a pointer to the item if successful, NULL if memory allocation fails.
void *enqueue(Queue *queuePtr, void *newItem)
{
    ListNode *pNewNode = (ListNode *) malloc(sizeof(ListNode));

    if (pNewNode != NULL) {
        pNewNode->next = NULL;
        pNewNode->dataPtr = newItem;

        if (queuePtr->size != 0) {
            // Queue has items: link new node after current rear
            queuePtr->rear->next = pNewNode;
            queuePtr->rear = pNewNode;
        } else {
            // Queue is empty: new node is both front and rear
            queuePtr->front = pNewNode;
            queuePtr->rear = pNewNode;
        }
        (queuePtr->size)++;
        return newItem;
    } else {
        return NULL;
    }
}

// Remove an item from the front of the queue.
// Returns a pointer to the item if successful, NULL if the queue is empty.
// The caller is responsible for freeing the returned item.
void *dequeue(Queue *queuePtr)
{
    if (queuePtr->size == 0) {
        return NULL;
    }

    ListNode *pFront = queuePtr->front;
    void *item = pFront->dataPtr;

    queuePtr->front = pFront->next;
    (queuePtr->size)--;

    // If queue is now empty, rear pointer must also be cleared
    if (queuePtr->size == 0) {
        queuePtr->rear = NULL;
    }

    free(pFront);
    return item;
}

// Return the number of items currently in the queue.
int queueSize(const Queue queue)
{
    return queue.size;
}

// Print each item in the queue from front to rear, one per line.
void printQueue(const Queue queue, FILE *stream)
{
    const ListNode *p = queue.front;
    while (p != NULL) {
        fprintf(stream, ITEM_FORMAT "\n", *(ItemType *)p->dataPtr);
        p = p->next;
    }
}
