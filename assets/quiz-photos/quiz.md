# C Programming Quiz

---

## Question 1

```c
#include <stdio.h>

int show();
void main()
{
    int a;
    a = show();
    printf("%d", a);
}

int show()
{
    printf("3");
    return 5;
    printf("4");
}
```

What is the output?

- [ ] 354
- [ ] 5
- [x] 35
- [ ] 3

---

## Question 2

What is the scope of a local variable in C?

- [ ] within the project where it is created.
- [ ] within the file where it is created.
- [x] within the function where it is created.
- [ ] within the *main* function and the function where it is created.

---

## Question 3

`fscanf()` cannot get input from console (terminal).

- [ ] True
- [x] False

---

## Question 4

```c
#include <stdio.h>

void printWords(char str) // line A
{
    printf("%s ", str); // line B
}

int main(void)
{
    char *words[] = {"A", "Happy", "Quiz"}; // line C
    for(int i = 0; i < 3; i++)
    {
        printWords(words[i]); // line D
    }
    return 0;
}
```

Which line causes a problem?

- [ ] line B
- [x] line A
- [ ] line D
- [ ] line C

---

## Question 5

*test* is the compiled code of a C program:

```c
#include <stdio.h>

int main(int argc, char *argv[])
{
    ...
}
```

What is the value of `argv[1]` if the following command is executed?

```
./test a1 b2 c3
```

- [ ] b2
- [ ] c3
- [x] a1
- [ ] test

---

## Question 6

The `stdio.h` file associates three file pointers with the three standard files automatically opened by C programs. Which of the following is **not** a file pointer?

- [ ] stdin
- [ ] stdout
- [x] stdall
- [ ] stderr

---

## Question 7

```c
char ch = '$';
putc(ch, stdout);
```

Which of the following is **not** equivalent to the above code?

- [x] `char ch = '$'; printf(ch);`
- [ ] `char ch = '$'; fprintf(stdout, "%c", ch);`
- [ ] `printf("$");`
- [ ] `char ch = '$'; printf("%c", ch);`

---

## Question 8

Parameters, return type and function name are all *mandatory* parts in function declaration.

- [ ] True
- [x] False

---

## Question 9

```c
fp = fopen("test.txt", ______);
```

The above code is used to open a file for writing. What is the missing code?

- [ ] "r"
- [ ] "a"
- [x] "w"
- [ ] "b"

---

## Question 10

Which of the following creates a file pointer?

- [x] `FILE *fp;`
- [ ] `int fp;`
- [ ] `FILE fp;`
- [ ] `int *fp;`
