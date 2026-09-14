
#include <stdio.h>
#include <stdlib.h>
#define MAX 100

//queue structure
typedef struct{
    
    int array[MAX];
    int front;
    int rear;
    
}Queue;

//queue initialize

void init(Queue *q){
    q->front = -1;
    q->rear = -1;
}

//add an item to queue
//enqueue only touches rear

void enqueue(Queue *q, int a){
    
    if (q->rear == MAX-1) //check if queue is full
    {
        fprintf(stderr, "The queue is full, cannot add %d\n", a);
    }
    else
    {
        q->rear +=1; // index the rear
        q->array[q->rear] = a; // add value to array at rear index
        
        

        if (q->front == -1) // if the queue is empty index front
        {
            q->front += 1;
        }
    }
}

int dequeue(Queue *q){
    
    if (q->front == -1) //check if the queue is empty already
    {
        fprintf(stderr, "dequeue failed: the queue is already empty\n");
        return -1; // since type is int, needs a return type
    }
    else
    {
        int var = q->front; // temp variable to store front index
        q->front += 1; //index front
        printf("dequeue: %d removed from front of queue\n", q->array[var]); // print value being removed
        
        if (q->front > q->rear)
        {
            q->front = -1;
            q->rear = -1;
        }
        
        return q->array[var]; // return the value removed from the queue
    }
 
}

void printQueue(Queue *q){
    
    for(int i = q->front; i <= q->rear; i++)
    {
        
            printf("%d ", q->array[i]);
            
    }
    printf("\n");
}

int peek(Queue *q){
    if (q->front == -1){
        fprintf(stderr, "Queue is empty\n");
        return -1;
    }
    return q->array[q->front];
}

int main(int argc, char** argv) {

    Queue q1;
    init(&q1);
    enqueue(&q1,5);
    enqueue(&q1,7);
    enqueue(&q1,8);
    enqueue(&q1,2);
    enqueue(&q1,59);
    enqueue(&q1,3);
    
    printQueue(&q1);
    
    dequeue(&q1);
    dequeue(&q1);
    printQueue(&q1);
    
    
    return (EXIT_SUCCESS);
}

