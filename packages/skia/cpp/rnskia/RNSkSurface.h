#pragma once

#include <vector>

#include "RNSkGraphiteTargetInfo.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "include/core/SkImage.h"
#include "include/gpu/graphite/Recording.h"

#pragma clang diagnostic pop

namespace RNSkia {

/**
 * What a view presents into: the window of the platform view
 * (RNSkWindowSurface) or an offscreen surface (RNSkOffscreenSurface). Only
 * what RNSkView::present needs from either: the description of the target
 * texture and the replay onto it.
 */
class RNSkSurface {
public:
  virtual ~RNSkSurface() = default;

  /** Width of the surface, in pixels. */
  virtual int getWidth() = 0;

  /** Height of the surface, in pixels. */
  virtual int getHeight() = 0;

  /**
   Describes the current target texture. Safe to call from any thread;
   returns false while there is no surface to describe.
   */
  virtual bool getTargetInfo(RNSkGraphiteTargetInfo *info) = 0;

  /**
   Replays the recordings, in order, onto the target texture and presents
   it. The target is the one the caller read with getTargetInfo() and chose
   the recordings for: a surface that is no longer that target (resized from
   another thread since) declines, as the recordings would not fit it.
   Called on the thread that presents on the surface. Returns false when the
   surface cannot present right now (there is none, the app is in the
   background, or the surface is not the target given): nothing was
   consumed.
   */
  virtual bool presentRecordings(
      const RNSkGraphiteTargetInfo &target,
      const std::vector<skgpu::graphite::Recording *> &recordings) = 0;

  /**
   Draws an image at the origin of the target texture and presents it. Same
   target, thread and return value as presentRecordings(). Used for a
   recording whose size or color space differs from the target's: it is
   replayed into a texture of its own first (see RNSkView::present).
   */
  virtual bool presentImage(const RNSkGraphiteTargetInfo &target,
                            const sk_sp<SkImage> &image) = 0;
};

} // namespace RNSkia
