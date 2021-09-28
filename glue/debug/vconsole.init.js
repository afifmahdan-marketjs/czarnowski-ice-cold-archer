/* 
Initialization & Configuaration 
- https://github.com/Tencent/vConsole 
- https://github.com/Tencent/vConsole/blob/dev/doc/tutorial.md 
- https://github.com/Tencent/vConsole/blob/dev/doc/public_properties_methods.md 
*/ 

// init vConsole 
var vConsole = new VConsole();

// config vConsole
vConsole.setOption('onReady', function() {
    // change zIndex onReady
    var zIndex = {
        "vc-switch": 1000000, 
        "vc-mask": 1000001, 
        "vc-panel": 1000002
    };
    
    for (vcDom in zIndex) {
        vConsole.$dom.getElementsByClassName(vcDom)[0].style.zIndex = zIndex[vcDom];
    }
});