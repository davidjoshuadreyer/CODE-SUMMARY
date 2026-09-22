#pragma once
#include <string>
namespace lab02 {
inline constexpr double MIN_MARK = 0.0;
inline constexpr double MAX_MARK = 100.0;
inline constexpr double MIN_WEIGHT = 1.0;
inline constexpr double MAX_WEIGHT = 50.0;
inline constexpr double TOTAL_WEIGHT = 100.0;
inline constexpr double WEIGHT_TOLERANCE = 0.1;
bool getValidNumber(std::string prompt, double* value, const double min, const double max);
std::string gradeFromMark(const double mark);
}
