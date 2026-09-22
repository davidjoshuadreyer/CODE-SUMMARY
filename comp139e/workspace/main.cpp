#include "labs/AllLabs.hpp"
#include "tutorials/Tutorials.hpp"
#include "examples/Examples.hpp"
#include <exception>
#include <iostream>
#include <string>

using namespace std;

// F5 with no arguments: an example takes priority, then tutorial, then lab.
// Example: "TestCircleWithHeader". Use "" to return to tutorials/labs.
const string ACTIVE_EXAMPLE = "TestCircleWithPrivateDataFields";  // "" to run tutorials/labs instead.
// 0 runs ACTIVE_LAB; 1-18 runs that tutorial instead.
constexpr int ACTIVE_TUTORIAL = 18;
constexpr int ACTIVE_LAB = 1;

int main(int argc, char* argv[]) {
    try {
        // You can also call a lesson or lab directly here:
        // return tutorials::pointers();
        // return tutorials::referenceDemo();
        // return lab01::run();
        // Command-line selections override the default constants above.
        if (argc == 1 && !ACTIVE_EXAMPLE.empty())
        {
            return examples::run(ACTIVE_EXAMPLE);
        }
        if (argc == 1 && ACTIVE_TUTORIAL != 0)
        {
            return tutorials::run(ACTIVE_TUTORIAL);
        }

        int lab = ACTIVE_LAB;
        if (argc > 1) {
            const string selection = argv[1];
            if (selection == "example")
            {
                if (argc == 2 || (argc == 3 && string(argv[2]) == "--list"))
                {
                    examples::printList();
                    return 0;
                }
                if (argc != 3)
                {
                    cerr << "Usage: main example NAME\n";
                    return 1;
                }
                return examples::run(argv[2]);
            }
            if (selection == "tutorial")
            {
                if (argc == 2 || (argc == 3 && string(argv[2]) == "--list"))
                {
                    tutorials::printList();
                    return 0;
                }
                // Compare complete strings so inputs such as "3oops" are rejected.
                int tutorialNumber = 0;
                for (int i = 1; i <= 18; i++)
                {
                    if (string(argv[2]) == to_string(i)) tutorialNumber = i;
                }
                // Only lesson 12 takes two extra arguments: input and output paths.
                if (tutorialNumber == 12 && argc == 5)
                {
                    return tutorials::files(argv[3], argv[4]);
                }
                if (tutorialNumber == 0 || argc != 3)
                {
                    cerr << "Usage: main tutorial 1-18\n"
                         << "       main tutorial 12 input.txt output.txt\n";
                    return 1;
                }
                return tutorials::run(tutorialNumber);
            }
            if (selection == "--list") {
                cout << "Labs (run: main NUMBER)\n"
                             "1 Surveying\n2 Grades\n3 Spherical coordinates\n"
                             "4 Text files\n5 Digital controllers\n6 Linked stack\n"
                             "7 STL vectors\n8 Harmonic motion (MATLAB)\n"
                             "9 Numerical integration (MATLAB)\n";
                cout << endl;
                tutorials::printList();
                cout << "\nRun main example --list to see the reference examples.\n";
                return 0;
            }
            if (selection.size() != 1 || selection[0] < '1' || selection[0] > '9') {
                cerr << "Usage: main [1-9 | --list] [lab arguments]\n"
                     << "       main tutorial [1-18 | --list]\n"
                     << "       main example [NAME | --list]\n";
                return 1;
            }
            lab = selection[0] - '0';
            // Give lab drivers standard argc/argv; first lab argument is argv[1].
            --argc;
            ++argv;
        }
        switch (lab) {
        case 1: return lab01::run();
        case 2: return lab02::run();
        case 3: return lab03::run(argc, argv);
        case 4: return lab04::run(argc, argv);
        case 5: return lab05::run();
        case 6: return lab06::run();
        case 7: return lab07::run();
        case 8:
            cout << "In MATLAB, open labs/lab08 and run harmonicScript.\n";
            return 0;
        case 9:
            cout << "In MATLAB, open labs/lab09 and run integrationError.\n";
            return 0;
        default:
            cerr << "ACTIVE_LAB must be between 1 and 9.\n";
            return 1;
        }
    } catch (const exception& error) {
        cerr << error.what() << '\n';
        return 1;
    }
}
