
#include <stdio.h>
#include <stdlib.h>

#define MAX 100

typedef struct{
    int array[MAX];
    int top;
    
}Stack;

void init(Stack *s){
    s->top = -1;
}

void push(Stack *s, int a){
    if(s->top == (MAX-1)){
        fprintf(stderr, "Unable to push %d, stack is full\n", a);
    }
    else{
        printf("Pushing %d\n", a);
        s->top += 1;
        s->array[s->top] = a;
        
    }
}

int pop(Stack *s){
    //check if stack is empty
    if(s->top == -1){
        fprintf(stderr, "Unable to pop, stack is empty\n");
        return -1;
    }
    else{
        
        int val = s->array[s->top];
        
        s->top -= 1;
        
        printf("popping %d\n", val);
        return val;
    }
}

int peek(Stack *s){
    //check if stack is empty
    if(s->top == -1){
        fprintf(stderr, "Unable to peek, stack is empty\n");
        return -1;
    }
    else{
        printf("peeking %d\n", s->array[s->top]);
        return s->array[s->top];
        
    }
}

void printstack(Stack *s){
    
    for(int i = 0; i<=s->top; i++){
        printf("%d ", s->array[i]);
    }
    
    printf("\n");
}

void sortstack(Stack *s) {
    for(int i = 0; i <= s->top; i++){
        for(int j = 0 ; j <= (i-1); j++){
            
            if (s->array[j] > s->array[j+1]){
                int temp = s->array[j+1];
                s->array[j+1] = s->array[j];
                s->array[j] = temp;        
            }
            
        }
    }
}

int main(int argc, char** argv) {

    Stack s1;
    
    init(&s1);
    
    push(&s1, 3);
    
    push(&s1, 5);
    push(&s1, 7);
    push(&s1, 5);
    push(&s1, 6);
    
    peek(&s1);
    
    pop(&s1);
    
    peek(&s1);
    
    printstack(&s1);
    
    sortstack(&s1);
    
    printstack(&s1);
    
    peek(&s1);
    
    return (EXIT_SUCCESS);
}

