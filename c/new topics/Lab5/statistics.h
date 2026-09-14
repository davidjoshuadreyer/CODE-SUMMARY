/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/cFiles/file.h to edit this template
 */

/* 
 * File:   statistics.h
 * Author: david
 *
 * Created on February 22, 2026, 11:00 a.m.
 */

#ifndef STATISTICS_H
#define STATISTICS_H

//Compute mean from sum and count
double mean(const double sum, const int count);

//Compute sample standard deviation from sum, sum of squares, and count
double ssdev(const double sum, const double sumsq, const int count);


#endif /* STATISTICS_H */

