# @shopify/react-native-skia.podspec

require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "react-native-skia"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.description  = <<-DESC
                  @shopify/react-native-skia
                   DESC
  s.homepage     = "https://github.com/shopify/react-native-skia"
  # brief license entry:
  s.license      = "MIT"
  # optional - use expanded license entry instead:
  # s.license    = { :type => "MIT", :file => "LICENSE" }
  s.authors      = { "Your Name" => "yourname@email.com" }
  s.platforms    = { :ios => "9.0" }
  s.source       = { :git => "https://github.com/shopify/react-native-skia/react-native-skia.git", :tag => "#{s.version}" }

  s.requires_arc = true
  s.pod_target_xcconfig = {
    'GCC_PREPROCESSOR_DEFINITIONS' => '$(inherited) SK_GL=1 SK_METAL=1 SK_ENABLE_SKSL=1 SK_GANESH=1',
    'CLANG_CXX_LANGUAGE_STANDARD' => 'c++17',
    'DEFINES_MODULE' => 'YES'
  }

  s.frameworks = 'GLKit', 'MetalKit'

  s.ios.vendored_frameworks = [
    'libs/ios/libskia.xcframework', 
    'libs/ios/libsvg.xcframework', 
    'libs/ios/libskshaper.xcframework',
    #'libs/ios/libskparagraph.xcframework',
    #'libs/ios/libskunicode.xcframework',
  ]

  # All iOS cpp/h files
  s.source_files = [
    "ios/**/*.{h,c,cc,cpp,m,mm,swift}",  
  ]

  s.subspec 'SkiaHeaders' do |ss|
    ss.header_mappings_dir = 'cpp/skia'
    ss.source_files = "cpp/skia/**/*.{h,cpp}"
  end

  s.subspec 'Utils' do |ss|
    ss.header_mappings_dir = 'cpp/utils'
    ss.source_files = "cpp/utils/**/*.{h,cpp}"
  end

  s.subspec 'Jsi' do |ss|
    ss.header_mappings_dir = 'cpp/jsi'
    ss.source_files = "cpp/jsi/**/*.{h,cpp}"
  end

  s.subspec 'Api' do |ss|
    ss.header_mappings_dir = 'cpp/api'
    ss.source_files = "cpp/api/**/*.{h,cpp}"
  end

  s.subspec 'RNSkia' do |ss|
    ss.header_mappings_dir = 'cpp/rnskia'
    ss.source_files = "cpp/rnskia/**/*.{h,cpp}"
  end

  s.dependency "React"
  s.dependency "React-callinvoker"
  s.dependency "React-Core"
end
