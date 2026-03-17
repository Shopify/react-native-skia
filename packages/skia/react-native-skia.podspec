# @shopify/react-native-skia.podspec

require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

# Check if Graphite is enabled via marker file (created by install-skia-graphite)
use_graphite = File.exist?(File.join(__dir__, 'libs', '.graphite'))
puts "-- SK_GRAPHITE: #{use_graphite ? 'ON' : 'OFF'} (detected via libs/.graphite marker file)"

# Set preprocessor definitions based on GRAPHITE flag
preprocessor_defs = use_graphite ?
  '$(inherited) SK_GRAPHITE=1 SK_IMAGE_READ_PIXELS_DISABLE_LEGACY_API=1 SK_DISABLE_LEGACY_SHAPER_FACTORY=1' :
  '$(inherited) SK_METAL=1 SK_GANESH=1 SK_IMAGE_READ_PIXELS_DISABLE_LEGACY_API=1 SK_DISABLE_LEGACY_SHAPER_FACTORY=1'

# Define framework names
framework_names = ['libskia', 'libsvg', 'libskshaper', 'libskparagraph',
                   'libskunicode_core', 'libskunicode_libgrapheme',
                   'libskottie', 'libsksg']

# Verify that prebuilt binaries have been installed by the postinstall script
unless Dir.exist?(File.join(__dir__, 'libs', 'ios')) && Dir.exist?(File.join(__dir__, 'libs', 'macos'))
  Pod::UI.warn "#{'-' * 72}"
  Pod::UI.warn "react-native-skia: Skia prebuilt binaries not found in libs/!"
  Pod::UI.warn ""
  Pod::UI.warn "Run the following command to install them:"
  Pod::UI.warn "  npx install-skia"
  Pod::UI.warn "#{'-' * 72}"
  raise "react-native-skia: Skia prebuilt binaries not found. Run `npx install-skia` to fix this."
end

# Build platform-specific framework paths (relative to pod's libs directory)
# xcframeworks are copied into libs/ by the npm postinstall script (scripts/install-libs.js)
ios_frameworks = framework_names.map { |f| "libs/ios/#{f}.xcframework" }
osx_frameworks = framework_names.map { |f| "libs/macos/#{f}.xcframework" }
# tvOS frameworks - check if libs/tvos/ exists (populated by postinstall before pod install runs)
tvos_frameworks = if use_graphite || !Dir.exist?(File.join(__dir__, 'libs', 'tvos'))
  []
else
  framework_names.map { |f| "libs/tvos/#{f}.xcframework" }
end

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
    "HEADER_SEARCH_PATHS" => '"$(PODS_TARGET_SRCROOT)/cpp/"/** "$(PODS_TARGET_SRCROOT)/cpp" "$(PODS_TARGET_SRCROOT)/cpp/jsi2" "$(PODS_TARGET_SRCROOT)/cpp/rnwgpu" "$(PODS_TARGET_SRCROOT)/cpp/rnwgpu/api" "$(PODS_TARGET_SRCROOT)/cpp/rnwgpu/api/descriptors" "$(PODS_TARGET_SRCROOT)/cpp/rnwgpu/async" "$(PODS_TARGET_SRCROOT)/cpp/dawn/include"'
  }

  s.frameworks = ['MetalKit', 'AVFoundation', 'AVKit', 'CoreMedia']

  # Platform-specific vendored frameworks (copied into libs/)
  s.ios.vendored_frameworks = ios_frameworks
  s.osx.vendored_frameworks = osx_frameworks

  # tvOS frameworks only available for non-Graphite builds
  unless use_graphite
    s.tvos.vendored_frameworks = tvos_frameworks
  end

  # Preserve the copied libs directory
  s.preserve_paths = ["libs/**/*"]

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
    'cpp/rnskia/RNImageProvider.h',
    'cpp/rnwgpu/**/*.{h,cpp}',
    'cpp/jsi2/**/*.{h,cpp}'
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
