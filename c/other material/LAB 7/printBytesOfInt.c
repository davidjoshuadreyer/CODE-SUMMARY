/* 
 * File:   printBytesOfInt.c
 * Author: Mao
 *
 * Created on March 5, 2024, 8:18 PM
 */

#include <stdio.h>

int main(int argc, char** argv) {

    int n = 1011;
    // 1011's binary code is 1111110011
    // 1st byte: 11110011 -> 243
    // 2nd byte: 00000011 -> 3
    // 3rd byte: 00000000 -> 0
    // 4th byte: 00000000 -> 0
    unsigned char *p = (unsigned char *) &n;
    for(int i =0; i < sizeof(int); i++)
    {
        printf("%hhu ", *p); // %u for unsigned integers 
        p++;
    }
    return 0;
}