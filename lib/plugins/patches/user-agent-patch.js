/**
* User Agent patch to workaround device detection method
*/

ig.module(
    "plugins.patches.user-agent-patch"
).requires(
    
).defines(function () {
    // iPad iOS Safari 13 workaround: https://www.indigoblue.eu/2019/work-around-for-user-agent-in-safari-on-ipados
    // Errin's workaround for Mozeus: https://docs.google.com/document/d/1r12sEaRjWE6PDpKZi0DvqzSUEYVoU9x4r11KCl_fTUw/edit?usp=sharing
    ig.ua.touchDevice = ('ontouchstart' in window) || (window.navigator.msMaxTouchPoints) || (window.navigator.maxTouchPoints);
    ig.ua.is_mac = (navigator.platform === 'MacIntel');
    
    ig.ua.iOS = (ig.ua.touchDevice && ig.ua.is_mac) || ig.ua.iOS;
    ig.ua.mobile = ig.ua.iOS || ig.ua.mobile;
});
