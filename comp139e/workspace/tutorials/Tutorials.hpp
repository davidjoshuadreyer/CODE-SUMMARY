#pragma once
#include <string>

// These declarations let main.cpp call any lesson directly.
namespace tutorials {
void printList();
int run(int number);
int basics();
int inputAndDecisions();
int functions();
int arraysAndStrings();
int pointers();
int modulesAndTesting();
int classes();
int inheritance();
int templates();
int linkedLists();
int stacksAndQueues();
int files(const std::string& inputPath = "tutorials/data/mixed.txt",
          const std::string& outputPath = "tutorials/output/words-and-numbers.txt");
int exceptions();
int vectors();
int control();
int harmonicMotion();
int integration();
int referenceDemo();
}
