cmake_minimum_required(VERSION 3.20)
project(COMP139E LANGUAGES CXX)
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

# Compile working labs and tutorials. Reference examples are added individually.
file(GLOB_RECURSE LAB_SOURCES CONFIGURE_DEPENDS "${CMAKE_CURRENT_SOURCE_DIR}/labs/*.cpp")
file(GLOB_RECURSE TUTORIAL_SOURCES CONFIGURE_DEPENDS "${CMAKE_CURRENT_SOURCE_DIR}/tutorials/*.cpp")
add_executable(main main.cpp ${LAB_SOURCES} ${TUTORIAL_SOURCES})
# Lesson 18 demonstrates linking a reference implementation with its header.
target_sources(main PRIVATE reference/examples/Demo/CricleX.cpp)
target_include_directories(main PRIVATE "${CMAKE_CURRENT_SOURCE_DIR}")

# Keep the instructor's file unchanged while sharing our one main().
set_source_files_properties(labs/lab03/testTrigMain.cpp PROPERTIES
    COMPILE_DEFINITIONS "main=lab03InstructorMain")

# Stable executable path for Visual Studio and single-configuration builds.
set_target_properties(main PROPERTIES
    RUNTIME_OUTPUT_DIRECTORY "${CMAKE_BINARY_DIR}/bin/$<0:>")
set_property(TARGET main PROPERTY VS_DEBUGGER_WORKING_DIRECTORY "${CMAKE_CURRENT_SOURCE_DIR}")

# Standalone reference examples, selected through main.exe example NAME.
add_subdirectory(examples)
