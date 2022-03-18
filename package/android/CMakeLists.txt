cmake_minimum_required(VERSION 3.4.1)

set (CMAKE_VERBOSE_MAKEFILE ON)
set (CMAKE_CXX_STANDARD 17)
set (CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -DSK_GL -DSK_BUILD_FOR_ANDROID -DFOLLY_NO_CONFIG=1 -DFOLLY_HAVE_CLOCK_GETTIME=1 -DFOLLY_HAVE_MEMRCHR=1 -DFOLLY_USE_LIBCPP=1 -DFOLLY_MOBILE=1 -DON_ANDROID -DONANDROID")

set (PACKAGE_NAME "reactskia")
set (SKIA_LIB "skia")
set (SKIA_SVG_LIB "svg")
set (SKIA_SKSHAPER_LIB "skshaper")

set(build_DIR ${CMAKE_SOURCE_DIR}/build)
file (GLOB LIBRN_DIR "${build_DIR}/react-native-0*/jni/${ANDROID_ABI}")
file(GLOB libfbjni_link_DIRS "${build_DIR}/fbjni*.aar/jni/${ANDROID_ABI}")
file(GLOB libfbjni_include_DIRS "${build_DIR}/fbjni-*-headers.jar/")

link_directories(../libs/android/${ANDROID_ABI}/)

add_library(
        ${PACKAGE_NAME}
        SHARED
        "${PROJECT_SOURCE_DIR}/cpp/jni/JniLoad.cpp"
        "${PROJECT_SOURCE_DIR}/cpp/jni/JniSkiaManager.cpp"
        "${PROJECT_SOURCE_DIR}/cpp/jni/JniSkiaDrawView.cpp"
        "${PROJECT_SOURCE_DIR}/cpp/jni/JniPlatformContext.cpp"
        
        "${PROJECT_SOURCE_DIR}/cpp/jsi/JsiHostObject.cpp"

        "${PROJECT_SOURCE_DIR}/cpp/rnskia/RNSkManager.cpp"
        "${PROJECT_SOURCE_DIR}/cpp/rnskia/RNSkDrawView.cpp"
        "${PROJECT_SOURCE_DIR}/cpp/rnskia/RNSkDispatchQueue.cpp"
)


target_include_directories(
        ${PACKAGE_NAME}
        PRIVATE

        # When installed in the development environment
        "../node_modules/react-native/ReactCommon/callinvoker"
        "../node_modules/react-native/ReactCommon/jsi"
        "../node_modules/react-native/ReactCommon/react/nativemodule/core"
        "../node_modules/react-native/ReactAndroid/src/main/java/com/facebook/react/turbomodule/core/jni"

        # When installed as a package the paths are a bit different
        "../../../react-native/ReactCommon/callinvoker"
        "../../../react-native/ReactCommon/jsi"
        "../../../react-native/ReactCommon/react/nativemodule/core"
        "../../../react-native/ReactAndroid/src/main/java/com/facebook/react/turbomodule/core/jni"

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
        cpp/jni/include
        cpp/rnskia
        cpp/rnskia/values
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

find_library(
        JSI_LIB
        jsi
        PATHS ${LIBRN_DIR}
        NO_CMAKE_FIND_ROOT_PATH
)

find_library(
        REACT_LIB
        react_nativemodule_core
        PATHS ${LIBRN_DIR}
        NO_CMAKE_FIND_ROOT_PATH
)

find_library(
        FBJNI_LIBRARY 
        fbjni 
        PATHS ${libfbjni_link_DIRS}
        NO_CMAKE_FIND_ROOT_PATH
)

find_library(
        TURBOMODULES_LIB
        turbomodulejsijni
        PATHS ${LIBRN_DIR}
        NO_CMAKE_FIND_ROOT_PATH
)

# Link
target_link_libraries(
        ${PACKAGE_NAME}
        ${LOG_LIB}
        ${FBJNI_LIBRARY}
        ${REACT_LIB}
        ${JSI_LIB}
        ${TURBOMODULES_LIB}
        ${SKIA_SVG_LIB}
        ${SKIA_SKSHAPER_LIB}
        ${SKIA_LIB}
        -ljnigraphics
        -lGLESv2
        -lEGL
        -landroid
    )