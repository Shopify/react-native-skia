#pragma once

#include <algorithm>
#include <numeric>
#include <stack>
#include <utility>
#include <vector>

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include <SkRefCnt.h>

#pragma clang diagnostic pop

namespace RNSkia {

/**
 Small container for shaders, filters, masks and effects
 */
template <typename T> class Declaration {
public:
  // Pushes to the stack
  void push(sk_sp<T> el) { _elements.push(el); }

  // Clears and returns all elements
  std::vector<sk_sp<T>> popAll() {
    auto tmp = peekAll();
    clear();
    return tmp;
  }

  // Pops the number of items up to limit
  std::vector<sk_sp<T>> popMultiple(size_t limit) {
    auto size = std::min(limit, _elements.size());
    std::vector<sk_sp<T>> tmp;
    tmp.reserve(size);
    for (size_t i = 0; i < size; ++i) {
      tmp.push_back(_elements.top());
      _elements.pop();
    }
    return tmp;
  }

  sk_sp<T> pop() {
    if (_elements.size() == 0) {
      return nullptr;
    }
    auto tmp = _elements.top();
    _elements.pop();
    return tmp;
  }

  // Returns the last element if any
  sk_sp<T> peek() {
    if (_elements.size() == 0) {
      return nullptr;
    }
    return _elements.top();
  }

  // Clears and returns through reducer function in reversed order
  sk_sp<T>
  popAsOne(std::function<sk_sp<T>(sk_sp<T> inner, sk_sp<T> outer)> composer) {
    auto tmp = popAll();
    // std::reverse(std::begin(tmp), std::end(tmp));
    return std::accumulate(std::begin(tmp), std::end(tmp),
                           static_cast<sk_sp<T>>(nullptr),
                           [=](sk_sp<T> inner, sk_sp<T> outer) {
                             if (inner == nullptr) {
                               return outer;
                             }
                             return composer(inner, outer);
                           });
  }

  // Returns through reducer function in reversed order
  sk_sp<T>
  peekAsOne(std::function<sk_sp<T>(sk_sp<T> inner, sk_sp<T> outer)> composer) {
    auto tmp = peekAll();
    // std::reverse(std::begin(tmp), std::end(tmp));
    return std::accumulate(std::begin(tmp), std::end(tmp),
                           static_cast<sk_sp<T>>(nullptr),
                           [=](sk_sp<T> inner, sk_sp<T> outer) {
                             if (inner == nullptr) {
                               return outer;
                             }
                             return composer(inner, outer);
                           });
  }

  // Clears all elements
  void clear() {
    while (!_elements.empty()) {
      _elements.pop();
    }
  }

  // Resets without calling did Change
  void reset() {
    while (!_elements.empty()) {
      _elements.pop();
    }
  }

  // Returns the size of the elements
  size_t size() { return _elements.size(); }

protected:
  // Returns all elements in copied list
  std::vector<sk_sp<T>> peekAll() {
    std::vector<sk_sp<T>> tmp;
    tmp.reserve(_elements.size());
    while (!_elements.empty()) {
      tmp.push_back(_elements.top());
      _elements.pop();
    }
    return tmp;
  }

  std::stack<sk_sp<T>> _elements;
};

/**
 Small container for shaders, filters, masks and effects
 */
template <typename T> class ComposableDeclaration : public Declaration<T> {
public:
  /**
   Constructor
   */
  explicit ComposableDeclaration(
      std::function<sk_sp<T>(sk_sp<T> inner, sk_sp<T> outer)> composer)
      : Declaration<T>(), _composer(composer) {}

  // Clears and returns through reducer function in reversed order
  sk_sp<T> popAsOne() { return Declaration<T>::popAsOne(_composer); }

  // Returns through reducer function in reversed order
  sk_sp<T> peekAsOne() { return Declaration<T>::peekAsOne(_composer); }

private:
  std::function<sk_sp<T>(sk_sp<T> inner, sk_sp<T> outer)> _composer;
};

} // namespace RNSkia
