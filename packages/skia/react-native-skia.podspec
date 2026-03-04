# @shopify/react-native-skia.podspec

require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

# Check if Graphite is enabled
use_graphite = false
if ENV['SK_GRAPHITE']
  use_graphite = ENV['SK_GRAPHITE'] == '1' || ENV['SK_GRAPHITE'].downcase == 'true'
  puts "-- SK_GRAPHITE: using environment variable (#{use_graphite ? 'ON' : 'OFF'})"
else
  puts "-- SK_GRAPHITE: OFF (set SK_GRAPHITE=1 to enable)"
end

# Set preprocessor definitions based on GRAPHITE flag
preprocessor_defs = use_graphite ?
  '$(inherited) SK_GRAPHITE=1 SK_IMAGE_READ_PIXELS_DISABLE_LEGACY_API=1 SK_DISABLE_LEGACY_SHAPER_FACTORY=1' :
  '$(inherited) SK_METAL=1 SK_GANESH=1 SK_IMAGE_READ_PIXELS_DISABLE_LEGACY_API=1 SK_DISABLE_LEGACY_SHAPER_FACTORY=1'

# Define framework names
framework_names = ['libskia', 'libsvg', 'libskshaper', 'libskparagraph',
                   'libskunicode_core', 'libskunicode_libgrapheme',
                   'libskottie', 'libsksg']

# Build platform-specific framework paths (relative to pod's libs directory)
ios_frameworks = framework_names.map { |f| "libs/ios/#{f}.xcframework" }
osx_frameworks = framework_names.map { |f| "libs/macos/#{f}.xcframework" }
# tvOS frameworks - will be populated by prepare_command if available
tvos_frameworks = use_graphite ? [] : framework_names.map { |f| "libs/tvos/#{f}.xcframework" }

# Prepare command resolves paths at RUNTIME (not evaluation time) to ensure deterministic checksums
# This script:
# 1. Checks if xcframeworks are already installed (e.g., from Graphite script)
# 2. If not, resolves npm package paths and copies xcframeworks
# The script content is deterministic - no machine-specific paths embedded in the podspec
prepare_command_script = <<-'SCRIPT'
node -e "
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

const iosLibs = 'libs/ios';
const macosLibs = 'libs/macos';

// Check if xcframeworks are already installed
const hasIos = fs.existsSync(iosLibs) && fs.readdirSync(iosLibs).some(f => f.endsWith('.xcframework'));
const hasMacos = fs.existsSync(macosLibs) && fs.readdirSync(macosLibs).some(f => f.endsWith('.xcframework'));

if (hasIos && hasMacos) {
  console.log('-- Using pre-installed xcframeworks from libs/');
  process.exit(0);
}

// Determine package prefix based on SK_GRAPHITE env var
const useGraphite = process.env.SK_GRAPHITE === '1' || process.env.SK_GRAPHITE === 'true';
const prefix = useGraphite ? 'react-native-skia-graphite' : 'react-native-skia';

// Resolve package paths
let iosPackage, macosPackage, tvosPackage;
try {
  iosPackage = path.dirname(require.resolve(prefix + '-apple-ios/package.json'));
  macosPackage = path.dirname(require.resolve(prefix + '-apple-macos/package.json'));
} catch (e) {
  console.error('ERROR: Could not find ' + prefix + '-apple-ios or ' + prefix + '-apple-macos');
  console.error('Make sure you have run yarn install or npm install');
  process.exit(1);
}

// Verify xcframeworks exist in the packages
const iosXcf = path.join(iosPackage, 'libs');
if (!fs.existsSync(iosXcf) || !fs.readdirSync(iosXcf).some(f => f.endsWith('.xcframework'))) {
  console.error('ERROR: Skia prebuilt binaries not found in ' + prefix + '-apple-ios!');
  process.exit(1);
}

console.log('-- Skia iOS package: ' + iosPackage);
console.log('-- Skia macOS package: ' + macosPackage);

// Clean and copy
execSync('rm -rf libs/ios libs/macos libs/tvos', { stdio: 'inherit' });
execSync('mkdir -p libs/ios libs/macos', { stdio: 'inherit' });
execSync('cp -R \"' + iosPackage + '/libs/\"*.xcframework libs/ios/', { stdio: 'inherit' });
execSync('cp -R \"' + macosPackage + '/libs/\"*.xcframework libs/macos/', { stdio: 'inherit' });

// Handle tvOS (non-Graphite only)
if (!useGraphite) {
  try {
    tvosPackage = path.dirname(require.resolve(prefix + '-apple-tvos/package.json'));
    console.log('-- Skia tvOS package: ' + tvosPackage);
    execSync('mkdir -p libs/tvos', { stdio: 'inherit' });
    execSync('cp -R \"' + tvosPackage + '/libs/\"*.xcframework libs/tvos/', { stdio: 'inherit' });
  } catch (e) {
    console.log('-- tvOS package not found, skipping');
  }
}

console.log('-- Copied xcframeworks from npm packages');
"
SCRIPT

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

  # Copy xcframeworks from npm packages into pod directory structure
  # The script is deterministic - path resolution happens at runtime, not evaluation time
  s.prepare_command = prepare_command_script

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
