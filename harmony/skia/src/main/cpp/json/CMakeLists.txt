cmake_minimum_required(VERSION 3.13)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_VERBOSE_MAKEFILE on)

add_definitions(-DOHOS_PLATFORM)

file(GLOB Jsoncpp CONFIGURE_DEPENDS
    ./src/*.cpp
    )

add_library(jsoncpp SHARED ${Jsoncpp})

target_include_directories(jsoncpp PUBLIC ${CMAKE_CURRENT_SOURCE_DIR}/include)
target_include_directories(jsoncpp PUBLIC ${CMAKE_CURRENT_SOURCE_DIR}/src)
target_include_directories(jsoncpp PUBLIC ${CMAKE_CURRENT_SOURCE_DIR})


