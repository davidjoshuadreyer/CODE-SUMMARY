/* 
 * File:   StackException.hpp
 * Author: dale
 *
 * Created on November 14, 2011, 6:40 PM
 * Changed to inherit std::exception Oct. 5, 2021
 */

#ifndef STACKEXCEPTION_HPP
#define	STACKEXCEPTION_HPP

#include <exception>
#include <string>

class StackException: public std::exception {
protected:
    std::string message;

public:
    explicit StackException(const std::string& msg) noexcept : message(msg) {
	// The keyword "explicit" says that this constructor will not do implicit type conversion
	// noexcept says that this function will not throw an exeption.
    }

    virtual const char* what(void) const noexcept {
	return message.c_str();
    }
};


#endif	/* STACKEXCEPTION_HPP */
