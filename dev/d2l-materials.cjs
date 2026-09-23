/* Source titles and topic IDs read from the signed-in D2L Content UI on 2026-09-23.
   These are access-controlled links, not downloaded copies or an automated sync. */
const data={};
function add(course,ou,group,lines){for(const line of lines.trim().split('\n')){const [id,...name]=line.split('|');(data[course]??=[]).push({id,title:name.join('|'),group,url:`https://online.camosun.ca/d2l/le/content/${ou}/viewContent/${id}/View`,access:'Camosun login'});}}
add('phys210',348967,'Administration',`5448870|PHYS 210 X01A TimeLine 2026F
5470883|PHYS 210 X01A Electricity and Magnetism - Simple Syllabus`);
add('phys210',348967,'Lab resources',`5448840|PHYS 210 Lab Manual Complete 2024
5448838|PHYS 210 Lab 1 ANS
5448842|Sample Lab Report 1st Year
5458938|Excel Graph Template`);
add('phys210',348967,'Handouts and review',`5448835|Formula Package 2 v2
5448808|PHYS 210 295 E Derivations
5448806|Sample Formal Lab Report PHYS 210 295
5448807|PHYS 210 Formulas - Partial 2023F
5448813|PHYS 104 FORMULA REV (2)
5448814|PHYS 101 104 WORK ENERGY POWER
5448812|P210 CK#1 2004W PRACTISE
5448823|PHYSICS 210 RC Circuits NEW
5448829|Formula Package 2
5448824|PHYS 210 Resistor Network Ex
5448825|PHYS 295 DC R network
5448826|PHYS 210 Kirchhoff Rules Lab
5448827|PHYS 210 295 Kirchhoff's Laws Sample Problem with Kramer's Rule
5448828|PHYS 210 295 DEMONSTRATION of E/M
5448834|PHYS 210 295 Magnetic Induction Lab
5448852|P154 Tutorial on Dot Product Cross Product`);
add('phys210',348967,'Homework',`5448796|PHYS 210 Homework 1
5448805|PHYS 210 Homework 2`);
add('phys210',348967,'Released solutions',`5448810|PHYS 210 Homework 1 SOLUTIONS
5448809|PHYS 210 Homework 2 SOLUTIONS`);
add('phys210',348967,'Tutorials',`5448797|1 Kinematics & Coulomb
5448798|2 E field Dist
5448843|PHYS 210 Tutorial 2 short
5448799|3 E Flux
5448800|4 Gauss Law
5448801|5 E Potential
5448802|6 Capacitance
5448803|7 Cap Combo
5448804|8 DC Circuits B Force on Charges
5448845|9 Mag Force on Charges
5448846|10 B force Calc B
5448847|11 B field & Induction`);
add('ecet250e',347548,'Course notes',`5366816|ECET 250E-WEEK 01-CHAPTER 01-BASIC CONCEPTS
5366853|ECET 250E-WEEK 01-CHAPTER 01-BASIC CONCEPTS- With Solutions
5366818|ECET 250E-WEEK 02-CHAPTER 02-BASIC LAW
5366854|ECET 250E-WEEK 02-CHAPTER 02-BASIC LAW-With Solutions
5366821|ECET 250E-WEEK 03-CHAPTER 03-METHODS OF ANALYSIS
5366851|ECET 250E-WEEK 03-CHAPTER 03-Cramers Rule`);
add('ecet250e',347548,'Course information',`5366807|ECET 250E-Linear Circuits 1-CourseOutline-Fall 2025
5366808|ECET 250E-Linear Circuit 1-Timetable-Fall 2025
5366809|ECET 250E-Linear Circuit 1-ProblemSets Policy
5366813|ECET 250E-Linear Circuit 1-Rubric For Assessing Lab Reports and Lab Rules
5366810|ECET 250E-Linear Circuit 1-Basic Differentiation- integration formulas and Rules
5366814|ECET 250E-WEEK 03-CHAPTER 03-Cramers Rule`);
add('ecet250e',347548,'Labs and Multisim',`5366817|ECET 250E- Lab 1- Lab Equipment and Devices Guide
5366820|Lab 2 - Simple circuits using breadboard, resistances and DC power supply (Word)
5366819|Lab 2 - Simple circuits using breadboard, resistances and DC power supply (PDF)
5366822|Lab 3 - Multisim Simulation and Experimental Verification (Word)
5366823|Lab 3 - Multisim Simulation and Experimental Verification (PDF)
5366826|ECET 250E-MultiSim Tutorial
5366824|ECET 250E-Getting Started with NI Circuit Design Suite
5366825|ECET 250E-MultiSim Default ShortCuts
5366827|ECET 250E-MultiSim User Manual
5366830|Lab 4 - Resistive DC Circuits: Kirchhoff’s law and Voltage Divider (PDF)
5366831|Lab 4 - Resistive DC Circuits: Kirchhoff’s law and Voltage Divider (Word)`);
add('ecet250e',347548,'Released solutions',`5366866|Problemset 1 - Chapter 1 - Solution (Word)
5366867|Problemset 2 - Chapter 2 - Solution (PDF)
5366868|Problemset 3 - Chapter 3 - Solution (PDF)`);
add('engr290',347881,'Course information',`5421418|ENGR290CourseOutline_2026
5421419|ENGR-290-X01 course syllabus_2026`);
add('engr290',347881,'Lecture slides',`5421421|Week 1 Atomic Structure_2026
5421575|Week 2a Bonding_2026
5421576|Week 2b Dislocations_2026`);
add('engr290',347881,'Assignments',`5465527|ENGR 290_Assign_1_2026`);
add('comp139e',347338,'Course information',`5457464|COMP 139E X01A Syllabus`);
add('comp139e',347338,'Labs',`5404942|Example of a well-documented program.
5404902|139E - Lab 1
5404903|139E - Lab 2
5404904|139E - Lab 3
5404905|139E - Lab 4
5404906|139E - Lab 5
5404907|139E - Lab 6
5404908|139E - Lab 7
5404909|139E - Lab 8
5404931|139E - Lab 9A
5404932|Lab9 (ZIP)`);
add('comp139e',347338,'C++ code',`5474694|COMP139E_All_Code_VS
5470753|VS Code running problems
5469452|COMP139E_All_Code
5469307|Lec1
5404912|0-1_Introduction
5404901|1-1_Functions
5404913|1-2_Pointers_and_DMM
5404943|1-3_Objects_and_Classes
5404914|1-4_Files_and_Exception_Handling
5404915|1-5_Object-Oriented_Programming
5404916|1-6_Stacks_and_Queues
5404917|1-7_Linked_Lists`);
add('comp139e',347338,'MATLAB code',`5404929|Simulink
5404928|Symbolic
5404927|Numerical Techniques
5404926|Graphics
5404925|Arrays
5404924|Matrix
5404923|Loop
5404922|IO_Selection
5404921|Functions
5404920|Plotting
5404919|Basics
5404918|Intro`);
add('comp139e',347338,'Weekly lectures',`5404940|Week 1 - Introduction to C++
5404956|Week 2 - Functions
5404951|Week 3 - Objects and Classes
5404950|Week 3 - Pointers and Dynamic Memory Management
5404979|Week 3 - In-class Example
5404978|Week 4 - Files and Exception Handling`);
data.math252=[{id:'252-coursepack',title:'Suggested problems with answers - Math 252 coursepack',group:'Homework and practice',url:'https://www.leahhoward.com/252CP.pdf',access:'Public instructor resource'},{id:'252-assignments',title:'Current assignments and submission instructions',group:'Homework and practice',url:'https://online.camosun.ca/d2l/lms/dropbox/dropbox.d2l?ou=348506',access:'Camosun login'}];
data.math250b=[{id:'250b-coursepack',title:'250B-CP.pdf - Suggested homework problems',group:'Homework and practice',url:'https://online.camosun.ca/d2l/le/news/widget/348474/FileProvider?newsId=707083&fileId=17250239',access:'Camosun login'},{id:'250b-website',title:'Leah Howard - current course materials',group:'Instructor resources',url:'https://www.leahhoward.com/',access:'Public instructor resource'},{id:'250b-assignments',title:'Current assignments and submission instructions',group:'Homework and practice',url:'https://online.camosun.ca/d2l/lms/dropbox/dropbox.d2l?ou=348474',access:'Camosun login'}];
module.exports=data;
