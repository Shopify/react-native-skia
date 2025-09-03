cmake_minimum_required(VERSION 3.13)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_VERBOSE_MAKEFILE on)
set (CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -DSK_GL -DSK_GANESH -DSK_BUILD_FOR_HAYMONY -DFOLLY_NO_CONFIG=1 -DFOLLY_HAVE_CLOCK_GETTIME=1 -DFOLLY_HAVE_MEMRCHR=1 -DFOLLY_USE_LIBCPP=1 -DFOLLY_MOBILE=1 -DON_HAYMONY -DONHAYMONY")

add_definitions(-DOHOS_PLATFORM)

add_subdirectory("./json" ./jsoncpp)

set (PACKAGE_NAME "rnoh_skia")
set (SKIA_LIB "skia")
set (SKIA_SVG_LIB "svg")
set (SKIA_SKSHAPER_LIB "skshaper")
set (SKIA_SKPARAGRAPH_LIB "skparagraph")
set (SKIA_SKUNICODE_LIB "skunicode")

file(GLOB rnoh_skia_SRC CONFIGURE_DEPENDS
    *.cpp
    ./napi/*.cpp

    ./skia/*.cpp
    ./skia/third_party/*.cpp
    ./skia_ohos/*.cpp
    ./rnskia/*.cpp
    ./skia/src/ports/SkFontHost_FreeType.cpp
    ./skia/src/core/SkScalerContext.cpp
    ./skia/src/core/SkTypeface.cpp
    ./skia/src/ports/SkFontHost_FreeType_common.cpp
    )
add_library(${PACKAGE_NAME} SHARED ${rnoh_skia_SRC})

target_include_directories(${PACKAGE_NAME} PUBLIC ${CMAKE_CURRENT_SOURCE_DIR})
target_include_directories(${PACKAGE_NAME} PUBLIC ${CMAKE_CURRENT_SOURCE_DIR}/skia)
target_include_directories(${PACKAGE_NAME} PUBLIC ${CMAKE_CURRENT_SOURCE_DIR}/skia/include/)
target_include_directories(${PACKAGE_NAME} PUBLIC ${CMAKE_CURRENT_SOURCE_DIR}/skia/src/)
target_include_directories(${PACKAGE_NAME} PUBLIC ${CMAKE_CURRENT_SOURCE_DIR}/rnskia)
target_include_directories(${PACKAGE_NAME} PUBLIC ${CMAKE_CURRENT_SOURCE_DIR}/include)
target_include_directories(${PACKAGE_NAME} PUBLIC ${CMAKE_CURRENT_SOURCE_DIR}/freetype)
target_include_directories(${PACKAGE_NAME} PUBLIC ${CMAKE_CURRENT_SOURCE_DIR}/src)
target_include_directories(${PACKAGE_NAME} PUBLIC ${CMAKE_CURRENT_SOURCE_DIR}/skia_ohos/)
target_include_directories(${PACKAGE_NAME} PUBLIC ${HMOS_SDK_NATIVE}/sysroot/usr/include)

target_link_directories(${PACKAGE_NAME} PUBLIC ${HMOS_SDK_NATIVE}/sysroot/usr/lib/aarch64-linux-ohos)
target_link_libraries(${PACKAGE_NAME} PUBLIC ${CMAKE_CURRENT_SOURCE_DIR}/lib/libthird_party__harfbuzz.a)
target_link_libraries(${PACKAGE_NAME} PUBLIC ${CMAKE_CURRENT_SOURCE_DIR}/lib/libthird_party__expat.a)
target_link_libraries(${PACKAGE_NAME} PUBLIC ${CMAKE_CURRENT_SOURCE_DIR}/lib/libthird_party__freetype2.a)
target_link_libraries(${PACKAGE_NAME} PUBLIC ${CMAKE_CURRENT_SOURCE_DIR}/lib/libthird_party__icu.a)
target_link_libraries(${PACKAGE_NAME} PUBLIC ${CMAKE_CURRENT_SOURCE_DIR}/lib/libthird_party__libjpeg-turbo_libjpeg.a)
target_link_libraries(${PACKAGE_NAME} PUBLIC ${CMAKE_CURRENT_SOURCE_DIR}/lib/libthird_party__libpng.a)
target_link_libraries(${PACKAGE_NAME} PUBLIC ${CMAKE_CURRENT_SOURCE_DIR}/lib/libthird_party__libwebp.a)
target_link_libraries(${PACKAGE_NAME} PUBLIC ${CMAKE_CURRENT_SOURCE_DIR}/lib/libthird_party__libwebp_libwebp_sse41.a)
target_link_libraries(${PACKAGE_NAME} PUBLIC ${CMAKE_CURRENT_SOURCE_DIR}/lib/libthird_party__wuffs.a)
target_link_libraries(${PACKAGE_NAME} PUBLIC ${CMAKE_CURRENT_SOURCE_DIR}/lib/libthird_party__zlib.a)
target_link_libraries(${PACKAGE_NAME} PUBLIC ${CMAKE_CURRENT_SOURCE_DIR}/lib/libthird_party__zlib_compression_utils_portable.a)

target_link_libraries(${PACKAGE_NAME} PUBLIC ${CMAKE_CURRENT_SOURCE_DIR}/lib/libmodules__skcms.a)
target_link_libraries(${PACKAGE_NAME} PUBLIC ${CMAKE_CURRENT_SOURCE_DIR}/lib/libmodules__bentleyottmann.a)
target_link_libraries(${PACKAGE_NAME} PUBLIC ${CMAKE_CURRENT_SOURCE_DIR}/lib/libmodules__skottie.a)
target_link_libraries(${PACKAGE_NAME} PUBLIC ${CMAKE_CURRENT_SOURCE_DIR}/lib/libmodules__skresources.a)
target_link_libraries(${PACKAGE_NAME} PUBLIC ${CMAKE_CURRENT_SOURCE_DIR}/lib/libmodules__sksg.a)
#target_link_libraries(${PACKAGE_NAME} PUBLIC ${CMAKE_CURRENT_SOURCE_DIR}/lib/libpathkit.a)

set (SKIA_LIBS_PATH "${CMAKE_CURRENT_SOURCE_DIR}/lib")
add_library(skia STATIC IMPORTED)
set_property(TARGET skia PROPERTY IMPORTED_LOCATION "${SKIA_LIBS_PATH}/libskia.a")

add_library(svg STATIC IMPORTED)
set_property(TARGET svg PROPERTY IMPORTED_LOCATION "${SKIA_LIBS_PATH}/libmodules__svg.a")

add_library(skshaper STATIC IMPORTED)
set_property(TARGET skshaper PROPERTY IMPORTED_LOCATION "${SKIA_LIBS_PATH}/libmodules__skshaper.a")

add_library(skparagraph STATIC IMPORTED)
set_property(TARGET skparagraph PROPERTY IMPORTED_LOCATION "${SKIA_LIBS_PATH}/libmodules__skparagraph.a")

add_library(skunicode STATIC IMPORTED)
set_property(TARGET skunicode PROPERTY IMPORTED_LOCATION "${SKIA_LIBS_PATH}/libmodules__skunicode.a")

find_library(
    # Sets the name of the path variable.
    EGL-lib
    # Specifies the name of the NDK library that
    # you want CMake to locate.
    EGL
)

find_library(
    # Sets the name of the path variable.
    GLES-lib
    # Specifies the name of the NDK library that
    # you want CMake to locate.
    GLESv3
)

find_library(
    # Sets the name of the path variable.
    hilog-lib
    # Specifies the name of the NDK library that
    # you want CMake to locate.
    hilog_ndk.z
)

find_library(
    # Sets the name of the path variable.
    libace-lib
    # Specifies the name of the NDK library that
    # you want CMake to locate.
    ace_ndk.z
)

find_library(
    # Sets the name of the path variable.
    libnapi-lib
    # Specifies the name of the NDK library that
    # you want CMake to locate.
    ace_napi.z
)

find_library(
    # Sets the name of the path variable.
    libuv-lib
    # Specifies the name of the NDK library that
    # you want CMake to locate.
    uv
)

target_link_libraries(
    ${PACKAGE_NAME}
    PUBLIC
    ${SKIA_SVG_LIB}
    ${SKIA_SKSHAPER_LIB}
    ${SKIA_SKPARAGRAPH_LIB}
    ${SKIA_SKUNICODE_LIB}
    ${SKIA_LIB}
    jsoncpp

    libnative_image.so
    libnative_window.so
    libnative_buffer.so
    libace_napi.z.so


    libavplayer.so
    libnative_media_core.so
    libnative_media_avsource.so
    libnative_media_acodec.so
    libnative_media_avdemuxer.so
    libnative_media_codecbase.so
    libnative_media_vdec.so
    libohaudio.so
    librcp_c.so

    ${EGL-lib} ${GLES-lib} ${hilog-lib} ${libace-lib} ${libnapi-lib} ${libuv-lib}

    libhilog_ndk.z.so
    libnative_display_manager.so
    librawfile.z.so
    libnative_drawing.so
    libpixelmap_ndk.z.so

    libEGL.so
    libGLESv3.so
    -lGLESv2
    -lEGL
#    ${CMAKE_CURRENT_SOURCE_DIR}../../../../libs/libcurl.so
)

target_link_libraries(${PACKAGE_NAME} PUBLIC rnoh)