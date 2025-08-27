# @shopify/react-native-skia.podspec

require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

# Check if Graphite symbols are available in libskia
libskia_path = File.join(__dir__, "libs/apple/libskia.xcframework")
use_graphite = false

if File.exist?(libskia_path)
  # Look for any arm64 or x86_64 framework inside the xcframework
  framework_paths = Dir.glob(File.join(libskia_path, "**/libskia.framework/libskia"))
  
  # Also try looking for static libraries if frameworks aren't found
  if framework_paths.empty?
    framework_paths = Dir.glob(File.join(libskia_path, "**/libskia.a"))
  end
  
  framework_paths.each do |framework_path|
    if File.exist?(framework_path)
      # Look for specific Dawn function symbols that indicate Graphite support
      dawn_symbols = [
        'dawn::',
        'wgpu',
        '_ZN4dawn',
        'DawnDevice',
        'dawn_native'
      ]
      
      dawn_symbols.each do |symbol|
        nm_output = `nm "#{framework_path}" 2>/dev/null | grep "#{symbol}"`
        if $?.success? && !nm_output.empty?
          use_graphite = true
          break
        end
      end
      
      break if use_graphite
    end
  end
end

if use_graphite
  puts "SK_GRAPHITE: ON (Graphite symbols found in libskia)"
else
  puts "SK_GRAPHITE: OFF (Graphite symbols not found in libskia)"
end

# Set preprocessor definitions based on GRAPHITE flag
preprocessor_defs = use_graphite ? 
  '$(inherited) SK_GRAPHITE=1 SK_IMAGE_READ_PIXELS_DISABLE_LEGACY_API=1 SK_DISABLE_LEGACY_SHAPER_FACTORY=1' : 
  '$(inherited) SK_METAL=1 SK_GANESH=1 SK_IMAGE_READ_PIXELS_DISABLE_LEGACY_API=1 SK_DISABLE_LEGACY_SHAPER_FACTORY=1'

# Define base frameworks
base_frameworks = ['libs/apple/libskia.xcframework', 
'libs/apple/libsvg.xcframework', 
'libs/apple/libskshaper.xcframework',
'libs/apple/libskparagraph.xcframework',
'libs/apple/libskunicode_core.xcframework',
'libs/apple/libskunicode_libgrapheme.xcframework',
'libs/apple/libskottie.xcframework',
'libs/apple/libsksg.xcframework',
'libs/apple/libpathops.xcframework',]

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
  s.platforms    = { :ios => "14.0", :tvos => "13.0", :osx => "11" }
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
    'cpp/rnskia/RNDawnContext.h',
    'cpp/rnskia/RNDawnUtils.h',
    'cpp/rnskia/RNDawnWindowContext.h', 
    'cpp/rnskia/RNDawnWindowContext.cpp',
    'cpp/rnskia/RNImageProvider.h'
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

