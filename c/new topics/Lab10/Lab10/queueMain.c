/* Tests for Queue library.
 *
 * Dale Shpak
 * March 25, 2022
 * March 29, 2023 - Improved input error handling
 */

#include <stdio.h>
#include <stdlib.h>
#include "queue.h"

// Menu choices for the user
typedef enum {QUIT=-1, ENQUEUE, DEQUEUE, PRINT, N_CHOICES} Choice;

int main(int ac, char *av[]) {
    // Initialize an empty queue
    Queue queue = {NULL, NULL, 0};

    int done = 0;
    while (!done) {
        Choice choice;
        int nValid;

        // Prompt until a valid choice is entered
        do {
            printf("Enter %d to add to queue, %d to remove, or %d to print contents "
                   "(%d to quit): ", ENQUEUE, DEQUEUE, PRINT, QUIT);
            nValid = scanf("%d", &choice);
            while (getchar() != '\n') { } // flush rest of input line
            if (nValid == 1 && choice >= QUIT && choice < N_CHOICES) {
                break;
            }
            fprintf(stderr, "Invalid Selection.  Try again.\n");
        } while (1);

        switch (choice) {

        case DEQUEUE: {
            // Remove the front item and print it, or report empty
            ItemType *itemPtr;
            if ((itemPtr = (ItemType *)dequeue(&queue)) != NULL) {
                printf("Removed " ITEM_FORMAT "\n", *itemPtr);
                free(itemPtr);
            } else {
                printf("Queue is empty\n");
            }
            break;
        }

        case ENQUEUE: {
            // Allocate memory for the new item, read a value, and enqueue it
            ItemType *itemPtr = (ItemType *) malloc(sizeof(ItemType));
            if (itemPtr == NULL) {
                fprintf(stderr, "%s: Error allocating memory for item.\n", av[0]);
                return EXIT_FAILURE;
            }

            printf("Enter " ITEM_PROMPT ": ");
            int nRead = scanf(ITEM_FORMAT, itemPtr);
            while (getchar() != '\n') { } // flush rest of input line
            if (nRead != 1) {
                fprintf(stderr, "Unable to read " ITEM_PROMPT "\n");
                break;
            }

            if ((itemPtr = enqueue(&queue, itemPtr)) != NULL) {
                printf("Added " ITEM_FORMAT "\n", *itemPtr);
            } else {
                fprintf(stderr, "%s: Error allocating memory to queue.\n", av[0]);
                return EXIT_FAILURE;
            }
            break;
        }

        case PRINT: {
            // Print how many items are in the queue and list them
            printf("%d Items currently in the queue:\n", queueSize(queue));
            printQueue(queue, stdout);
            break;
        }

        case QUIT: {
            done = 1;
            break;
        }

        default: {
            fprintf(stderr, "Not all enumerated cases are handled.\n");
            break;
        }
        }
    }

    // On exit, show any items still remaining in the queue
    printf("%d Items remaining in the queue:\n", queueSize(queue));
    printQueue(queue, stdout);

    return EXIT_SUCCESS;
}
