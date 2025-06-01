# @shopify/react-native-skia.podspec

require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

# Check if Dawn libraries exist, if so enable GRAPHITE
dawn_lib_path = File.join(__dir__, "libs/apple/libdawn_native_static.xcframework")
use_graphite = File.exist?(dawn_lib_path)

if use_graphite
  puts "SK_GRAPHITE: ON (Dawn libraries found)"
else
  puts "SK_GRAPHITE: OFF (Dawn libraries not found)"
end

# Set preprocessor definitions based on GRAPHITE flag
preprocessor_defs = use_graphite ? 
  '$(inherited) SK_GRAPHITE=1 SK_IMAGE_READ_PIXELS_DISABLE_LEGACY_API=1' : 
  '$(inherited) SK_METAL=1 SK_GANESH=1 SK_IMAGE_READ_PIXELS_DISABLE_LEGACY_API=1'

# Define base frameworks
base_frameworks = ['libs/apple/libskia.xcframework', 
'libs/apple/libsvg.xcframework', 
'libs/apple/libskshaper.xcframework',
'libs/apple/libskparagraph.xcframework',
'libs/apple/libskunicode_core.xcframework',
'libs/apple/libskunicode_libgrapheme.xcframework',]

Pod::Spec.new do |s|
  s.name         = "react-native-skia"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.description  = <<-DESC
                  @shopify/react-native-skia
                   DESC
  s.homepage     = "https://github.com/shopify/react-native-skia"
  s.license      = "MIT"
  s.license    = { :type => "MIT", :file => "LICENSE.md" }
  s.authors      = { 
    "Christian Falch" => "christian.falch@gmail.com",
    "William Candillon" => "wcandillon@gmail.com"
  }
  s.platforms    = { :ios => "13.0", :tvos => "13.0", :osx => "11" }
  s.source       = { :git => "https://github.com/shopify/react-native-skia/react-native-skia.git", :tag => "#{s.version}" }

  s.requires_arc = true
  s.pod_target_xcconfig = {
    'GCC_PREPROCESSOR_DEFINITIONS' => preprocessor_defs,
    'CLANG_CXX_LANGUAGE_STANDARD' => 'c++17',
    'DEFINES_MODULE' => 'YES',
    "HEADER_SEARCH_PATHS" => '"$(PODS_TARGET_SRCROOT)/cpp/"/**'
  }

  s.frameworks = ['MetalKit', 'AVFoundation', 'AVKit', 'CoreMedia']

  s.vendored_frameworks = base_frameworks

  # All iOS cpp/h files
  s.source_files = [
    "apple/**/*.{h,c,cc,cpp,m,mm,swift}",  
    "cpp/**/*.{h,cpp}"
  ]

  graphite_exclusions = [
    'cpp/rnskia/DawnContext.h',
    'cpp/rnskia/DawnUtils.h',
    'cpp/rnskia/DawnWindowContext.h', 
    'cpp/rnskia/DawnWindowContext.cpp',
    'cpp/rnskia/ImageProvider.h'
  ]
  s.exclude_files = graphite_exclusions unless use_graphite 

  if defined?(install_modules_dependencies()) != nil
    install_modules_dependencies(s)
    s.dependency "React"
    s.dependency "React-callinvoker"
    s.dependency "React-Core"
  else
    s.dependency "React"
    s.dependency "React-callinvoker"
    s.dependency "React-Core"
  end
end

