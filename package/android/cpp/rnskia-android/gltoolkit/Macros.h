// Based on https://github.com/flutter/engine/tree/main/impeller/toolkit/egl
#pragma once
#define DISALLOW_COPY_AND_ASSIGN(TypeName)                                     \
  TypeName(const TypeName &) = delete;                                         \
  TypeName &operator=(const TypeName &) = delete