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
  s.platforms      = { :ios => "13.0" }
  s.source_files  = "ios/**/*.{h,m,swift}"

  s.dependency "React-Core"
  s.dependency 'PromisesSwift', '2.4.0'
  s.dependency 'ComScore', '~> 6.0'
end
