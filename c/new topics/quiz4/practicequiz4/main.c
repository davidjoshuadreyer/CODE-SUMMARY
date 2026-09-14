
#include <stdio.h>
#include <stdlib.h>

typedef enum {
    HR,
    SALES,
    IT,
    FINANCE
}Department;

const char* departmentName[]={"HR","SALES","IT","FINANCE"};
        

typedef struct {
    int id;
    char name[50];
    Department dept;
    
}Employee;



int main(int argc, char** argv) {

    Employee e_1;
    
    e_1.dept = SALES;
    e_1.id = 356;
    snprintf(e_1.name, sizeof(e_1.name), "Greg");
   

    printf("%s %d %s", e_1.name, e_1.id, departmentName[e_1.dept]);

    return (EXIT_SUCCESS);
}

