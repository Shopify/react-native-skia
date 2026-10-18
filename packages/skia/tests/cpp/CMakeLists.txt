cmake_minimum_required(VERSION 3.22)
project(react_native_skia_cpp_tests LANGUAGES CXX)

# The podspec builds the library as C++17, the oldest standard it meets.
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED True)

include(FetchContent)
FetchContent_Declare(
  googletest
  URL https://github.com/google/googletest/releases/download/v1.18.0/googletest-1.18.0.tar.gz
  URL_HASH SHA256=6e3191c1455468b3fc35a417fb565c1c5071aee1b7e7f85e30cf48a98d37d8b5
  DOWNLOAD_EXTRACT_TIMESTAMP True
)
set(INSTALL_GTEST OFF CACHE BOOL "" FORCE)
FetchContent_MakeAvailable(googletest)

add_executable(
  cpp-tests
  RNSkPresentHoldTest.cpp
  RNSkReplayScheduleTest.cpp
)
target_include_directories(
  cpp-tests
  PRIVATE
  ${CMAKE_CURRENT_SOURCE_DIR}/../../cpp/rnskia
)
target_compile_options(cpp-tests PRIVATE -Wall -Wextra -Werror)
target_link_libraries(cpp-tests PRIVATE GTest::gtest_main)

enable_testing()
include(GoogleTest)
gtest_discover_tests(cpp-tests)
