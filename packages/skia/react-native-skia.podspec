# @shopify/react-native-skia.podspec

require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

# Check for GRAPHITE env var
use_graphite = ENV['SK_GRAPHITE'] == '1'

# Set preprocessor definitions based on GRAPHITE flag
preprocessor_defs = use_graphite ? 
  '$(inherited) SK_GRAPHITE=1' : 
  '$(inherited) SK_METAL=1 SK_GANESH=1'

# Define base frameworks
base_frameworks = ['libs/ios/libskia.xcframework', 
'libs/ios/libsvg.xcframework', 
'libs/ios/libskshaper.xcframework',
'libs/ios/libskparagraph.xcframework',
'libs/ios/libskunicode_core.xcframework',
'libs/ios/libskunicode_libgrapheme.xcframework',]

# Add Graphite frameworks if enabled
graphite_frameworks = [
  'libs/ios/libdawn_native_static.xcframework',
  'libs/ios/libdawn_platform_static.xcframework', 
  'libs/ios/libdawn_proc_static.xcframework'
]

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
  s.platforms    = { :ios => "13.0" }
  s.source       = { :git => "https://github.com/shopify/react-native-skia/react-native-skia.git", :tag => "#{s.version}" }

  s.requires_arc = true
  s.pod_target_xcconfig = {
    'GCC_PREPROCESSOR_DEFINITIONS' => preprocessor_defs,
    'CLANG_CXX_LANGUAGE_STANDARD' => 'c++17',
    'DEFINES_MODULE' => 'YES',
    "HEADER_SEARCH_PATHS" => '"$(PODS_TARGET_SRCROOT)/cpp/"/**'
  }

  s.frameworks = 'MetalKit'

  s.ios.vendored_frameworks = use_graphite ? 
  base_frameworks + graphite_frameworks :
  base_frameworks

  # All iOS cpp/h files
  s.source_files = [
    "ios/**/*.{h,c,cc,cpp,m,mm,swift}",  
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

