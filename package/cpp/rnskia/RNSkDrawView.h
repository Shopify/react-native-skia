#pragma once

#include <JsiSkCanvas.h>
#include <RNSkInfoParameter.h>
#include <RNSkPlatformContext.h>
#include <RNSkTimingInfo.h>
#include <mutex>

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "include/gpu/GrDirectContext.h"
#include "include/gpu/gl/GrGLInterface.h"
#include <SkSurface.h>

#pragma clang diagnostic pop

namespace RNSkia {

using RNSkDrawCallback =
    std::function<void(std::shared_ptr<JsiSkCanvas>, int, int, double,
                       std::shared_ptr<RNSkPlatformContext>)>;

enum RNSkDrawingMode { Default, Continuous };

class RNSkDrawView {
public:
  /**
   * Constructor
   */
  RNSkDrawView(std::shared_ptr<RNSkPlatformContext> context);

  /**
   Destructor
   */
  ~RNSkDrawView();

  /**
   * Repaints the Skia view using the underlying context and the drawcallback.
   * This method schedules a draw request that will be run on the correct
   * thread and js runtime.
   */
  void requestRedraw();

  /**
   * Installs the draw callback for the view
   */
  void setDrawCallback(std::shared_ptr<jsi::Function> callback);

  /**
   * Call this method with a valid Skia surface to let the draw drawCallback do
   * its thing.
   * It is important that the height and width parameters are not resolved
   * against the scale factor - this is done by the drawing code itself.
   */
  void drawInSurface(sk_sp<SkSurface>, int, int, double,
                     std::shared_ptr<RNSkPlatformContext>);

  /**
   Sets the drawing mode for the view
   */
  void setDrawingMode(RNSkDrawingMode mode);

  /**
   * Set to true to show the debug overlays on render
   */
  void setShowDebugOverlays(bool show) { _showDebugOverlay = show; }

  /**
    Update touch state with new touch points
   */
  void updateTouchState(const std::vector<RNSkTouchPoint> &points);

protected:
  /**
   * Setup and draw the frame
   */
  virtual void drawFrame(double time) = 0;

  /**
   Updates the last duration value
   */
  void setLastFrameDuration(size_t duration) {
    _timingInfo->addLastDuration(duration);
  }

  /**
   * @return The platformcontext
   */
  std::shared_ptr<RNSkPlatformContext> getPlatformContext() {
    return _platformContext;
  }

private:
  /**
   * Checks preconditions for drawing
   */
  bool isReadyToDraw();

  /**
   Starts beginDrawCallback loop if the drawing mode is continuous
   */
  void beginDrawingLoop();

  /**
   Ends an ongoing beginDrawCallback loop for this view
   */
  void endDrawingLoop();

  /**
   * Stores the draw drawCallback
   */
  std::shared_ptr<RNSkDrawCallback> _drawCallback;

  /**
   * Stores a pointer to the jsi wrapper for the canvas. The reason for
   * storing this pointer and not recreate it is that it creates a set of
   * functions that we don't want to recreate on each render
   */
  std::shared_ptr<JsiSkCanvas> _jsiCanvas;

  /**
   * is drawing flag
   */
  std::atomic<bool> _isDrawing{false};

  /**
   * Pointer to the platform context
   */
  std::shared_ptr<RNSkPlatformContext> _platformContext;

  /**
   Drawing mode
   */
  RNSkDrawingMode _drawingMode;

  /**
   * Show debug overlays
   */
  bool _showDebugOverlay = false;

  /**
   * True if the drawing loop has been requested
   */
  size_t _drawingLoopIdentifier = -1;

  /**
   * Info object parameter
   */
  std::shared_ptr<RNSkInfoObject> _infoObject;

  /**
   Timing information
   */
  std::shared_ptr<RNSkTimingInfo> _timingInfo;
  /**
   Redraw queue counter
   */
  std::atomic<int> _redrawRequestCounter;
};

} // namespace RNSkia
