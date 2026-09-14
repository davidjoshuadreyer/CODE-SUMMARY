/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/cFiles/main.c to edit this template
 */

/* 
 * File:   main.c
 * Author: c0525746
 *
 * Created on March 23, 2026, 8:58 AM
 */

#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>

// A single node in the linked list, storing an integer and a pointer to the next node
typedef struct node{
    int item;
    struct node *next;
}Node;

// The stack structure: tracks how many nodes it has and points to the top (most recently pushed) node
typedef struct{
    int size;
    Node *top;
}Stack;

// Pushes a new integer onto the top of the stack
// Returns true on success, false if memory allocation fails
bool push(Stack *s, int element)
{
//    if(s->top != NULL)
//        printf("%d ", s->top->item);
    //Node newNode = {element, NULL}; // local variable, it will be removed after the function finishes

    // Allocate memory on the heap for the new node
    Node *newNodePtr = (Node *)malloc(sizeof(Node));
    if(newNodePtr == NULL)
    {
        // malloc returns NULL when it cannot allocate memory
        printf("malloc failed");
        return false;
    }
    else
    {
        // Store the value and initialise next to NULL
        newNodePtr->item = element;
        newNodePtr->next = NULL;
        if(s->top == NULL) // s->size==0  empty
        {
            // Stack is empty — new node becomes the only element
            s->top = newNodePtr;
        }
        else //  not empty
        {
            // Point new node at the current top, then make it the new top
            newNodePtr->next = s->top;
            s->top = newNodePtr;
        }
        s->size++; // Update the count of nodes in the stack
    }
    return true;
}

// Removes the top element from the stack and returns its value via *result
// Returns true on success, false if the stack is empty
bool pop(Stack *s)
{
    if(s->top == NULL) // stack is empty, nothing to remove
    {
        return false; // signal failure to the caller
    }
    else if (s->top->next == NULL) // only one node in the stack
    {
        free(s->top);  // release the heap memory for that node
        s->top = NULL; // free() doesn't zero the pointer, so set it manually to mark the stack as empty
        s->size--;     // stack now has no nodes
    }
    else // more than one node in the stack
    {
        Node *temp = s->top;       // remember the current top so we can free it after moving the pointer
        s->top = s->top->next;     // advance top to the next node down before freeing, otherwise we lose the reference
        free(temp);                // release the old top node's memory
        s->size--;                 // one fewer node in the stack
    }

    return true; // pop succeeded
}


void printStack(Stack s)
{
   
    //printf("%d", s.top->item);
    
    Node *currentNodePtr = s.top;
    while(currentNodePtr != NULL)
    {
        printf(" %d \n", currentNodePtr->item);
        currentNodePtr = currentNodePtr->next;
    }

    
    
}

int main(int argc, char** argv) {

    // Initialise an empty stack: size 0, no nodes yet
    Stack s1 = {0, NULL};

    // Push three values; after these calls the stack is (top) 9 -> 7 -> 5
    push(&s1, 5);
    push(&s1, 7);
    push(&s1, 9);
    
    pop
    
    printStack(s1);
//    Node node1 = {5, NULL};
//    Node node2 = {4};
//    Node node3 = {3};
//    printf("%d", node1.item);
//    node1.next = &node2;
//    if(node1.next != NULL)
//        printf("%d", node1.next->item);
//    node2.next = &node3;
//    if(node2.next != NULL)
//        printf("%d\n", node2.next->item);
//    
//    printf("%d", node1.next->next->item);
//    
    return (EXIT_SUCCESS);
}

