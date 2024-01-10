/*
 * Copyright 2006 The Android Open Source Project
 *
 * Use of this source code is governed by a BSD-style license that can be
 * found in the LICENSE file.
 */
#pragma once

#include <cstddef>

namespace RNSkia {

struct Base64 {
public:
  enum class Error {
    kNone,
    kBadPadding,
    kBadChar,
  };

  /**
     Base64 encodes src into dst.

     Normally this is called once with 'dst' nullptr to get the required size,
     then again with an allocated 'dst' pointer to do the actual encoding.

     @param dst nullptr or a pointer to a buffer large enough to receive the
     result

     @return the required length of dst for encoding.
  */
  static size_t Encode(const void *src, size_t length, void *dst);

  /**
     Base64 decodes src into dst.

     Normally this is called once with 'dst' nullptr to get the required size,
     then again with an allocated 'dst' pointer to do the actual encoding.

     @param dst nullptr or a pointer to a buffer large enough to receive the
     result

     @param dstLength assigned the length dst is required to be. Must not be
     nullptr.
  */
  [[nodiscard]] static Error Decode(const void *src, size_t srcLength,
                                    void *dst, size_t *dstLength);
};

} // namespace RNSkia