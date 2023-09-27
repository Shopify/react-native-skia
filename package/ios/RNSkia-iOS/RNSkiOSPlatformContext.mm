#include "RNSkiOSPlatformContext.h"

#import <React/RCTUtils.h>
#include <thread>
#include <utility>

#include <SkiaMetalSurfaceFactory.h>

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "SkFontMgr.h"
#include "SkSurface.h"

#include "include/ports/SkFontMgr_mac_ct.h"

#pragma clang diagnostic pop

namespace RNSkia {

void RNSkiOSPlatformContext::performStreamOperation(
    const std::string &sourceUri,
    const std::function<void(std::unique_ptr<SkStreamAsset>)> &op) {

  auto loader = [=]() {
    NSURL *url = [[NSURL alloc]
        initWithString:[NSString stringWithUTF8String:sourceUri.c_str()]];

    NSData *data = nullptr;
    auto scheme = url.scheme;
    auto extension = url.pathExtension;

    if (scheme == nullptr &&
        (extension == nullptr || [extension isEqualToString:@""])) {
      // If the extension and scheme is nil, we assume that we're trying to
      // load from the embedded iOS app bundle and will try to load image
      // and get data from the image directly. imageNamed will return the
      // best version of the requested image:
      auto image = [UIImage imageNamed:[url absoluteString]];
      // We don't know the image format (png, jpg, etc) but
      // UIImagePNGRepresentation will support all of them
      data = UIImagePNGRepresentation(image);
    } else {
      // Load from metro / node
      data = [NSData dataWithContentsOfURL:url];
    }

    auto bytes = [data bytes];
    auto skData = SkData::MakeWithCopy(bytes, [data length]);
    auto stream = SkMemoryStream::Make(skData);

    op(std::move(stream));
  };

  // Fire and forget the thread - will be resolved on completion
  std::thread(loader).detach();
}

void RNSkiOSPlatformContext::raiseError(const std::exception &err) {
  RCTFatal(RCTErrorWithMessage([NSString stringWithUTF8String:err.what()]));
}

sk_sp<SkSurface> RNSkiOSPlatformContext::makeOffscreenSurface(int width,
                                                              int height) {
  return SkiaMetalSurfaceFactory::makeOffscreenSurface(width, height);
}

sk_sp<SkFontMgr> RNSkiOSPlatformContext::createFontMgr() {
  return SkFontMgr_New_CoreText(nullptr);
}

std::tuple<std::vector<SkUnicode::Position>, std::vector<SkUnicode::Position>,
           std::vector<SkUnicode::LineBreakBefore>>
RNSkiOSPlatformContext::tokenizeText(const std::string &inputText) {
  __block std::vector<SkUnicode::Position> wordsUtf16;
  __block std::vector<SkUnicode::Position> graphemesUtf16;
  __block std::vector<SkUnicode::LineBreakBefore> lineBreaksUtf16;

  NSString *text = [NSString stringWithUTF8String:inputText.c_str()];

  if (!text) {
    RCTFatal(RCTErrorWithMessage(
        [NSString stringWithUTF8String:"Couldn't convert text to NSString"]));
    return {};
  }

	// Initialize the lineBreaksUtf16 vector with a soft line break at the beginning of the text
	lineBreaksUtf16.push_back(SkUnicode::LineBreakBefore(0, SkUnicode::LineBreakType::kSoftLineBreak));

	// Calculate word breaks and line breaks
	NSLinguisticTagger *wordTagger = [[NSLinguisticTagger alloc]
		initWithTagSchemes:@[NSLinguisticTagSchemeTokenType]
				   options:0];
	wordTagger.string = text;

	[wordTagger
		enumerateTagsInRange:NSMakeRange(0, text.length)
					  scheme:NSLinguisticTagSchemeTokenType
					 options:NSLinguisticTaggerOmitWhitespace
				  usingBlock:^(NSLinguisticTag tag, NSRange tokenRange,
							   NSRange sentenceRange, BOOL *stop) {
					// Skip the first segment
					if (tokenRange.location == 0) {
						return;
					}
					if ([tag isEqualToString:NSLinguisticTagWord]) {
					  wordsUtf16.push_back(tokenRange.location);
					  // Add a soft line break at the end of a word
					  lineBreaksUtf16.push_back(SkUnicode::LineBreakBefore(
						  tokenRange.location,
						  SkUnicode::LineBreakType::kSoftLineBreak));
					} else {
					  // Check for newline character within the tokenRange
					  NSRange newlineRange = [text rangeOfString:@"\n"
														 options:0
														   range:tokenRange];
					  if (newlineRange.location != NSNotFound) {
						// Add a hard line break for newline character
						lineBreaksUtf16.push_back(SkUnicode::LineBreakBefore(
							newlineRange.location + newlineRange.length,
							SkUnicode::LineBreakType::kHardLineBreak));
					  }
					}
				  }];
	wordsUtf16.push_back(text.length);
	// Add a soft line break at the end of the text
	lineBreaksUtf16.push_back(SkUnicode::LineBreakBefore(text.length, SkUnicode::LineBreakType::kSoftLineBreak));


  // Calculate grapheme breaks
  __block NSUInteger graphemeStart = 0;
  [text
      enumerateSubstringsInRange:NSMakeRange(0, text.length)
                         options:NSStringEnumerationByComposedCharacterSequences
                      usingBlock:^(NSString *substring, NSRange substringRange,
                                   NSRange enclosingRange, BOOL *stop) {
                        graphemesUtf16.push_back(graphemeStart);
                        graphemeStart = graphemeStart + substringRange.length;
                      }];
  graphemesUtf16.push_back(graphemeStart);

  return {wordsUtf16, graphemesUtf16, lineBreaksUtf16};
}

void RNSkiOSPlatformContext::runOnMainThread(std::function<void()> func) {
  dispatch_async(dispatch_get_main_queue(), ^{
    func();
  });
}

sk_sp<SkImage>
RNSkiOSPlatformContext::takeScreenshotFromViewTag(size_t viewTag) {
  return [_screenshotService
      screenshotOfViewWithTag:[NSNumber numberWithLong:viewTag]];
}

void RNSkiOSPlatformContext::startDrawLoop() {
  if (_displayLink == nullptr) {
    _displayLink = [[DisplayLink alloc] init];
    [_displayLink start:^(double time) {
      notifyDrawLoop(false);
    }];
  }
}

void RNSkiOSPlatformContext::stopDrawLoop() {
  if (_displayLink != nullptr) {
    [_displayLink stop];
    _displayLink = nullptr;
  }
}

} // namespace RNSkia
