require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name           = 'react-native-comscore'
  s.version        = package['version']
  s.summary        = package['description']
  s.description    = package['description']
  s.license        = package['license']
  s.author         = package['author']

  s.homepage       = 'https://github.com/startcat/react-native-comscore'
  s.source         = { :git => "https://github.com/startcat/react-native-comscore", :tag => "v#{s.version}" }
  s.platforms      = { :ios => "13.0", :tvos => "13.0", :visionos => "1.0" }

  s.subspec "RNComscoreModule" do |ss|
    ss.source_files = "ios/Video/**/*.{h,m,swift}"
    ss.dependency 'PromisesSwift', '2.4.0'
    ss.dependency 'ComScore', '~> 6.0'

  end
  
  s.default_subspec = "RNComscoreModule"
end
