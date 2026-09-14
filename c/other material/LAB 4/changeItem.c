/*
 * C11 template
 * Build: cc -std=c11 -Wall -Wextra -Wpedantic -O2 -o app makeChange.c changeItem.c
 */

#include <math.h>
#include <stdio.h>

#include "changeItem.h"

double changeItem(double change, const double itemValue, const char *singleName,
                  const char *pluralName)
{
    long long changeCents = llround(change * 100.0);
    long long itemCents = llround(itemValue * 100.0);
    long long count = 0;
    long long remainingCents = changeCents;

    if (itemCents > 0) {
        count = changeCents / itemCents;
        remainingCents = changeCents - (count * itemCents);
    }

    if (count > 0) {
        const char *label = (count == 1) ? singleName : pluralName;
        printf("%lld %s\n", count, label);
    }

    return remainingCents / 100.0;
}
