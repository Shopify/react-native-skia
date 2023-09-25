#include "RNSkiOSPlatformContext.h"

#import <React/RCTUtils.h>
#import <Foundation/Foundation.h>

#include <thread>
#include <utility>
#include <vector>

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

void provideUnicodeDataToParagraph(para::ParagraphBuilder* paragraphBuilder) {
  auto inputText = paragraphBuilder->getText();
  __block std::vector<SkUnicode::Position> wordsUtf16;
  __block std::vector<SkUnicode::Position> graphemesUtf16;
	__block std::vector<SkUnicode::LineBreakBefore> lineBreaksUtf16;
      // Convert SkSpan<char> to NSString
    NSString *text = [[NSString alloc] initWithBytes:inputText.data() length:inputText.size() encoding:NSUTF8StringEncoding];
    
    // Check for conversion errors
    if (!text) {
		RCTFatal(RCTErrorWithMessage([NSString stringWithUTF8String:"Couldn't convert text to NSString"]));
        return;
    }
    
    // Calculate word breaks
    NSLinguisticTagger *wordTagger = [[NSLinguisticTagger alloc] initWithTagSchemes:@[NSLinguisticTagSchemeTokenType] options:0];
    wordTagger.string = text;
    [wordTagger enumerateTagsInRange:NSMakeRange(0, text.length)
                             scheme:NSLinguisticTagSchemeTokenType
                            options:NSLinguisticTaggerOmitWhitespace
                         usingBlock:^(NSLinguisticTag tag, NSRange tokenRange, NSRange sentenceRange, BOOL *stop) {
        if ([tag isEqualToString:NSLinguisticTagWord]) {
            wordsUtf16.push_back(tokenRange.location + tokenRange.length);
        }
    }];
    
    // Calculate grapheme breaks
    __block NSUInteger graphemeStart = 0;
    [text enumerateSubstringsInRange:NSMakeRange(0, text.length)
                             options:NSStringEnumerationByComposedCharacterSequences
                          usingBlock:^(NSString *substring, NSRange substringRange, NSRange enclosingRange, BOOL *stop) {
		graphemesUtf16.push_back(graphemeStart + substringRange.length);
        graphemeStart = graphemeStart + substringRange.length;
    }];
    
	// Calculate line breaks (example: break by sentences)
	NSLinguisticTagger *sentenceTagger = [[NSLinguisticTagger alloc] initWithTagSchemes:@[NSLinguisticTagSchemeLexicalClass] options:0];
	sentenceTagger.string = text;
	[sentenceTagger enumerateTagsInRange:NSMakeRange(0, text.length)
								  scheme:NSLinguisticTagSchemeLexicalClass
								 options:NSLinguisticTaggerOmitPunctuation
							  usingBlock:^(NSLinguisticTag tag, NSRange tokenRange, NSRange sentenceRange, BOOL *stop) {
		if ([tag isEqualToString:NSLinguisticTagSentenceTerminator]) {
			// Assign the appropriate LineBreakType
			SkUnicode::LineBreakType breakType = SkUnicode::LineBreakType::kHardLineBreak; // or kSoftLineBreak based on your criteria
			lineBreaksUtf16.push_back(SkUnicode::LineBreakBefore(tokenRange.location + tokenRange.length, breakType));
		}
	}];
    
    paragraphBuilder->setWordsUtf16(wordsUtf16);
    paragraphBuilder->setGraphemeBreaksUtf16(graphemesUtf16);
    paragraphBuilder->setLineBreaksUtf16(lineBreaksUtf16);
}


} // namespace RNSkia
