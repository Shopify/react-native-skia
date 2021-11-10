cmake_minimum_required(VERSION 3.4.1)

set (CMAKE_VERBOSE_MAKEFILE ON)
set (CMAKE_CXX_STANDARD 17)
set (CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -DSK_GL -DSK_BUILD_FOR_ANDROID -DFOLLY_NO_CONFIG=1 -DFOLLY_HAVE_CLOCK_GETTIME=1 -DFOLLY_HAVE_MEMRCHR=1 -DFOLLY_USE_LIBCPP=1 -DFOLLY_MOBILE=1 -DON_ANDROID -DONANDROID")

set (PACKAGE_NAME "reactskia")
set (SKIA_LIB "skia")
set (SKIA_SVG_LIB "svg")
set (SKIA_SKSHAPER_LIB "skshaper")

set(build_DIR ${CMAKE_SOURCE_DIR}/build)

link_directories(../libs/android/${ANDROID_ABI}/)

file(GLOB libfbjni_link_DIRS "${build_DIR}/fbjni*.aar/jni/${ANDROID_ABI}")
file(GLOB libfbjni_include_DIRS "${build_DIR}/fbjni-*-headers.jar/")

find_library(FBJNI_LIBRARY fbjni PATHS ${libfbjni_link_DIRS}
NO_CMAKE_FIND_ROOT_PATH)

add_library(
        ${PACKAGE_NAME}
        SHARED
        jni/JniLoad.cpp
        jni/JniSkiaManager.cpp
        jni/JniSkiaDrawView.cpp
        jni/JniPlatformContext.cpp
        
        cpp/rnskia/RNSkManager.cpp
        cpp/rnskia/RNSkDrawView.cpp
        cpp/api/JsiSkImageFilter.cpp
        cpp/api/JsiSkSvg.cpp        
)


target_include_directories(
        ${PACKAGE_NAME}
        PRIVATE
        
        "../node_modules/react-native/ReactCommon/callinvoker"
        "../node_modules/react-native/ReactCommon/jsi"
        "../node_modules/react-native/ReactCommon/react/nativemodule/core"  
        "../node_modules/react-native/ReactAndroid/src/main/java/com/facebook/react/turbomodule/core/jni"


        cpp/skia/include/config/
        cpp/skia/include/core/
        cpp/skia/include/effects/
        cpp/skia/include/utils/
        cpp/skia/include/pathops/
        cpp/skia/modules/
        cpp/skia/include/
        cpp/skia

        cpp/api
        cpp/jsi
        cpp/jni
        cpp/rnskia
        cpp/utils  

        ${libfbjni_include_DIRS}
)

# Import prebuilt SKIA libraries
set (SKIA_LIBS_PATH "${CMAKE_CURRENT_SOURCE_DIR}/../libs/android/${ANDROID_ABI}")
add_library(skia STATIC IMPORTED)
set_property(TARGET skia PROPERTY IMPORTED_LOCATION "${SKIA_LIBS_PATH}/libskia.a")

add_library(svg STATIC IMPORTED)
set_property(TARGET svg PROPERTY IMPORTED_LOCATION "${SKIA_LIBS_PATH}/libsvg.a")

add_library(skshaper STATIC IMPORTED)
set_property(TARGET skshaper PROPERTY IMPORTED_LOCATION "${SKIA_LIBS_PATH}/libskshaper.a")


find_library(
        LOG_LIB
        log
)

# Link
target_link_libraries(
        ${PACKAGE_NAME}
        ${LOG_LIB}
        ${FBJNI_LIBRARY}
        ${SKIA_SVG_LIB}
        ${SKIA_SKSHAPER_LIB}
        ${SKIA_LIB}
        -ljnigraphics
        -lGLESv2
        -lEGL
        -landroid
    )