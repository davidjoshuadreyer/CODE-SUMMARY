/*
 * TestStringClass.cpp
 *
 *  Created on: Jan. 23, 2022
 *      Author: mao
 */
#include <iostream>
#include <sstream>
#include <string>
using namespace std;

// Replace oldSubStr in s with newSubStr
bool replaceString(string& s, const string& oldSubStr, const string& newSubStr);

int testStringClass ()
{
	string s_two_steps = "Welcome to C++";
	string s_object("Welcome to C++");
	string s_empty;
	char c[] = "Good morning";
	string s_c_char(c);

	/*
	 * Appending to a String
	 */

	string s1("Welcome");
	s1.append(" to C++"); // Appends " to C++" to s1
	cout << "s1: " << s1 << endl; // s1 now becomes Welcome to C++
	string s2("Welcome");
	s2.append(" to C and C++", 0, 5); // Appends " to C" to s2
	cout << "s2: " << s2 << endl; // s2 now becomes Welcome to C
	string s3("Welcome");
	s3.append(" to C and C++", 5); // Appends " to C" to s3
	cout << "s3: " << s3 << endl; // s3 now becomes Welcome to C
	string s4("Welcome");
	s4.append(4, 'G'); // Appends "GGGG" to s4
	cout << "s4: " << s4 << endl; // s4 now becomes WelcomeGGGG

	/*
	 * Assigning a String
	 */
	string s5("Welcome");
	s5.assign("Dallas"); // Assigns "Dallas" to s1
	cout << "s5: " << s5 << endl; // s5 now becomes Dallas
	string s6("Welcome");
	s6.assign("Dallas, Texas", 0, 5); // Assigns "Dalla" to s6
	cout << "s6: " << s6 << endl; // s6 now becomes Dalla
	string s7("Welcome");
	s7.assign("Dallas, Texas", 5); // Assigns "Dalla" to s7
	cout << "s7: " << s7 << endl; // s7 now becomes Dalla
	string s8("Welcome");
	s8.assign(4, 'G'); // Assigns "GGGG" to s8
	cout << "s8: " << s8 << endl; // s8 now becomes GGGG

	/*
	 * Functions at, clear, erase, and empty
	 */
	cout << "s9:" << endl;
	string s9("Welcome");
	cout << s9.at(3) << endl; // s9.at(3) returns c
	cout << s9.erase(2, 3) << endl; // s9 is now Weme
	s9.clear(); // s9 is now empty
	cout << s9.empty() << endl; // s9.empty returns 1 (means true)

	/*
	 * Functions length, size, capacity, and c_str()
	 */
	cout << "s10:" << endl;
	string s10("Welcome");
	cout << s10.length() << endl; // Length is 7
	cout << s10.size() << endl; // Size is 7
	cout << s10.capacity() << endl; // Capacity is 15

	s10.erase(1, 2);
	cout << s10.length() << endl; // Length is now 5
	cout << s10.size() << endl; // Size is now 5
	cout << s10.capacity() << endl; // Capacity is still 15

	/*
	 * Comparing Strings
	 */
	cout << "s11 and s12:" << endl;
	string s11("Welcome");
	string s12("Welcomg");
	cout << s11.compare(s12) << endl; // Returns –1
	cout << s12.compare(s11) << endl; // Returns 1
	cout << s11.compare("Welcome") << endl; // Returns 0

	/*
	 * Obtaining Substrings
	 */
	cout << "s13: " << endl;
	string s13("Welcome");
	cout << s13.substr(0, 1) << endl; // Returns W
	cout << s13.substr(3) << endl; // Returns come
	cout << s13.substr(3, 3) << endl; // Returns com

	/*
	 * Searching in a String
	 */
	cout << "s14:" << endl;
	string s14("Welcome to HTML");
	cout << s14.find("co") << endl; // Returns 3
	cout << s14.find("co", 6) << endl; // Returns string::npos
	cout << s14.find('o') << endl; // Returns 4
	cout << s14.find('o', 6) << endl; // Returns 9

	/*
	 * Inserting and Replacing Strings
	 */
	string s15("Welcome to HTML");
	s15.insert(11, "C++ and ");
	cout << "s15: " << s15 << endl; // s15 becomes Welcome to C++ and HTML
	string s16("AA");
	s16.insert(1, 4, 'B');
	cout << "s16: " << s16 << endl; // s16 becomes to ABBBBA
	string s17("Welcome to HTML");
	s17.replace(11, 4, "C++");
	cout << "s17: " << s17 << endl; // s17 becomes Welcome to C++

	/*
	 * String Operators
	 */
	cout << "s18, s19 and s20:" << endl;
	string s18 = "ABC"; // The = operator
	string s19 = s18; // The = operator
	for (int i = s19.size() - 1; i >= 0; i--){
		cout << s19[i]; // The [] operator
	}
	string s20 = s18 + "DEFG"; // The + operator
	cout << s20 << endl; // s20 becomes ABCDEFG
	s18 += "ABC";
	cout << s18 << endl; // s18 becomes ABCABC
	s18 = "ABC";
	s19 = "ABE";
	cout << (s18 == s19) << endl; // Displays 0 (means false)
	cout << (s18 != s19) << endl; // Displays 1 (means true)
	cout << (s18 > s19) << endl; // Displays 0 (means false)
	cout << (s18 >= s19) << endl; // Displays 0 (means false)
	cout << (s18 < s19) << endl; // Displays 1 (means true)
	cout << (s18 <= s19) << endl; // Displays 1 (means true)

	/*
	 * Converting Numbers to Strings
	 */

	stringstream ss1;
	ss1 << 3.1415;
	string s21 = ss1.str();
	cout << "s21:" << s21 << endl;

	/*
	 * Splitting Strings
	 */

	cout << "s22:" << endl;
	string text("Programming is fun");
	stringstream ss2(text);

	cout << "The words in the text are " << endl;
	string word;
	while (!ss2.eof())
	{
		ss2 >> word;
		cout << word << endl;
	}

	/*
	 * Replacing Strings
	 */

	// Prompt the user to enter s, oldSubStr, and newSubStr
	cout << "Enter string s, oldSubStr, and newSubStr: ";
	string s, oldSubStr, newSubStr;
	cin >> s >> oldSubStr >> newSubStr;

	bool isReplaced = replaceString(s, oldSubStr, newSubStr);

	if (isReplaced)
		cout << "The replaced string is " << s << endl;
	else
		cout << "No matches" << endl;

	return 0;
}

bool replaceString(string& s, const string& oldSubStr, const string& newSubStr)
{
	bool isReplaced = false;
	int currentPosition = 0;
	while (currentPosition < s.length())
	{
		int position = s.find(oldSubStr, currentPosition);
		if (position == string::npos) // No more matches
			return isReplaced;
		else
		{
			s.replace(position, oldSubStr.length(), newSubStr);
			currentPosition = position + newSubStr.length();
			isReplaced = true; // At least one match
		}
	}

	return isReplaced;
}

