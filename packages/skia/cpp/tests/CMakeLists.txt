cmake_minimum_required(VERSION 3.16)
project(RNSkiaTests CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

include(FetchContent)
FetchContent_Declare(
  googletest
  URL https://github.com/google/googletest/releases/download/v1.17.0/googletest-1.17.0.tar.gz
  URL_HASH SHA256=65fab701d9829d38cb77c14acdc431d2108bfdbf8979e40eb8ae567edf10b27c
  DOWNLOAD_EXTRACT_TIMESTAMP TRUE
)
set(gtest_force_shared_crt ON CACHE BOOL "" FORCE)
set(INSTALL_GTEST OFF CACHE BOOL "" FORCE)
FetchContent_MakeAvailable(googletest)

enable_testing()

add_executable(RNSkiaTests RNSkTargetRegistryTest.cpp)
target_include_directories(RNSkiaTests PRIVATE ${CMAKE_CURRENT_SOURCE_DIR}/../rnskia)
target_link_libraries(RNSkiaTests PRIVATE GTest::gtest_main)

include(GoogleTest)
gtest_discover_tests(RNSkiaTests)
