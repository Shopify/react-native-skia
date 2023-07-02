// Copyright 2013 The Flutter Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#pragma once

#include <optional>

#include "Macros.h"
/*
#include "impeller/base/comparable.h"
#include "impeller/base/thread.h"
*/
#include "Proc.h"
#include "Surface.h"

namespace RNSkia {

class Context {
public:
  Context(EGLDisplay display, EGLContext context);

  ~Context();

  bool IsValid() const;

  const EGLContext &GetHandle() const;

  bool MakeCurrent(const Surface &surface) const;

  bool ClearCurrent() const;

  enum class LifecycleEvent {
    kDidMakeCurrent,
    kWillClearCurrent,
  };
  //   using LifecycleListener = std::function<void(LifecycleEvent)>;
  //   std::optional<UniqueID> AddLifecycleListener(
  //       const LifecycleListener& listener);

  //   bool RemoveLifecycleListener(UniqueID id);

private:
  EGLDisplay display_ = EGL_NO_DISPLAY;
  EGLContext context_ = EGL_NO_CONTEXT;
  //   mutable RWMutex listeners_mutex_;
  //   std::map<UniqueID, LifecycleListener> listeners_
  //       IPLR_GUARDED_BY(listeners_mutex_);

  //   void DispatchLifecyleEvent(LifecycleEvent event) const;

  DISALLOW_COPY_AND_ASSIGN(Context);
};

} // namespace RNSkia