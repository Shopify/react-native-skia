#import "DisplayLink.h"

@implementation DisplayLink

- (void)start:(block_t)block
{
    self.updateBlock = block;
    // check whether the loop is already running
    if(_displayLink == nil)
    {
        // specify update method
        _displayLink = [CADisplayLink displayLinkWithTarget:self selector:@selector(update:)];

        // add the display link to the run loop (will be called 60 times per second)
        [_displayLink addToRunLoop:[NSRunLoop mainRunLoop] forMode:NSRunLoopCommonModes];
        [[NSRunLoop currentRunLoop] run];
    }
}

- (void)stop
{
    // check whether the loop is already stopped
    if (_displayLink != nil) {
        // if the display link is present, it gets invalidated (loop stops)
        [_displayLink removeFromRunLoop:[NSRunLoop mainRunLoop] forMode:NSRunLoopCommonModes];
        [_displayLink invalidate];
        _displayLink = nil;
    }
}

- (void)update:(CADisplayLink *)sender
{
    double time = [sender timestamp];
    _updateBlock(time);
}

@end
