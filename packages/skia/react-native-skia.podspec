# @shopify/react-native-skia.podspec

require "json"
require "fileutils"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

# Check if Graphite is enabled via marker file (created by install-skia-graphite)
use_graphite = File.exist?(File.join(__dir__, 'libs', '.graphite'))
puts "-- SK_GRAPHITE: #{use_graphite ? 'ON' : 'OFF'} (detected via libs/.graphite marker file)"

# Resolve a node package directory using Node's own module resolution
# (mirrors `require.resolve(pkg/package.json)`). Returns nil if it can't be found.
# Defined as a lambda (not a `def`) because CocoaPods evaluates the podspec inside
# the `Pod` module, where top-level methods are not reachable at the call site.
resolve_node_package = lambda do |name, base_dir|
  script = "process.stdout.write(require('path').dirname(require.resolve('#{name}/package.json')))"
  dir = Dir.chdir(base_dir) { `node -e "#{script}" 2>/dev/null`.strip }
  dir.empty? ? nil : dir
end

# Copy the prebuilt xcframeworks from the Skia npm packages into libs/<platform>.
#
# This replaces what the old npm `postinstall` script used to do. We do it here, at
# `pod install` time, so we no longer rely on a lifecycle script. CocoaPods always
# re-evaluates the podspec for path-based pods, so this runs on every install; to keep
# it cache-friendly we stamp the copied package version into libs/<platform>/.version
# and skip the copy when it already matches. On a version bump the frameworks are
# re-copied and CocoaPods picks up the change. This is best-effort: if `pod install`
# does not detect the change, a clean reinstall fixes it (acceptable until the upcoming
# Swift Package Manager migration).
install_apple_skia_libs = lambda do |base_dir|
  { 'ios' => 'react-native-skia-apple-ios',
    'macos' => 'react-native-skia-apple-macos',
    'tvos' => 'react-native-skia-apple-tvos' }.each do |platform, pkg_name|
    pkg_dir = resolve_node_package.call(pkg_name, base_dir)
    next if pkg_dir.nil?

    src = File.join(pkg_dir, 'libs')
    next unless Dir.exist?(src) && !Dir.glob(File.join(src, '*.xcframework')).empty?

    version = JSON.parse(File.read(File.join(pkg_dir, 'package.json')))['version'].to_s
    dest = File.join(base_dir, 'libs', platform)
    marker = File.join(dest, '.version')

    # Already up to date: leave the files untouched so CocoaPods keeps its cache.
    next if File.exist?(marker) && File.read(marker).strip == version

    Pod::UI.puts "react-native-skia: installing #{platform} Skia frameworks (#{version})"
    FileUtils.rm_rf(dest)
    FileUtils.mkdir_p(dest)
    Dir.glob(File.join(src, '*.xcframework')).each { |xcf| FileUtils.cp_r(xcf, dest) }
    File.write(marker, version)
  end
end

# Graphite downloads its binaries directly into libs/; only the default build needs
# the npm packages copied in.
install_apple_skia_libs.call(__dir__) unless use_graphite

# Set preprocessor definitions based on GRAPHITE flag
preprocessor_defs = use_graphite ?
  '$(inherited) SK_GRAPHITE=1 SK_IMAGE_READ_PIXELS_DISABLE_LEGACY_API=1 SK_DISABLE_LEGACY_SHAPER_FACTORY=1' :
  '$(inherited) SK_METAL=1 SK_GANESH=1 SK_IMAGE_READ_PIXELS_DISABLE_LEGACY_API=1 SK_DISABLE_LEGACY_SHAPER_FACTORY=1'

# Define framework names
framework_names = ['libskia', 'libsvg', 'libskshaper', 'libskparagraph',
                   'libskunicode_core', 'libskunicode_libgrapheme',
                   'libskottie', 'libsksg']

# Add Dawn library for Graphite builds (contains dawn::native symbols)
framework_names += ['libdawn_combined'] if use_graphite

# Verify that the prebuilt binaries are available (copied in above, or downloaded by
# install-skia-graphite for Graphite builds).
unless Dir.exist?(File.join(__dir__, 'libs', 'ios')) && Dir.exist?(File.join(__dir__, 'libs', 'macos'))
  Pod::UI.warn "#{'-' * 72}"
  Pod::UI.warn "react-native-skia: Skia prebuilt binaries not found in libs/!"
  Pod::UI.warn ""
  Pod::UI.warn "Make sure dependencies are installed (yarn install / npm install) so that"
  Pod::UI.warn "the react-native-skia-apple-* packages are present, then run `pod install` again."
  Pod::UI.warn "#{'-' * 72}"
  raise "react-native-skia: Skia prebuilt binaries not found. Run `yarn install` then `pod install` to fix this."
end

# Build platform-specific framework paths (relative to pod's libs directory)
# xcframeworks are copied into libs/ by install_apple_skia_libs above (default build)
# or downloaded by install-skia-graphite (Graphite build).
ios_frameworks = framework_names.map { |f| "libs/ios/#{f}.xcframework" }
osx_frameworks = framework_names.map { |f| "libs/macos/#{f}.xcframework" }
# tvOS frameworks - check if libs/tvos/ exists (only populated for the default build)
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
    "HEADER_SEARCH_PATHS" => '"$(PODS_TARGET_SRCROOT)/cpp"/** "$(PODS_TARGET_SRCROOT)/cpp" "$(PODS_TARGET_SRCROOT)/cpp/skia" "$(PODS_TARGET_SRCROOT)/cpp/dawn/include"'
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
