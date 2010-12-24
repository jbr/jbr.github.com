$(function() {
    var deg2rad = function( degrees ) {
        return degrees * Math.PI / 180
    }

    var box = $( 'div' )

    $( window )
        .bind( 'deviceorientation', function( evt ) {
            evt = evt.originalEvent

            if ( typeof evt.alpha === 'undefined' )
                evt.alpha = 0

            box.css({
                WebkitTransform: "rotate(" + evt.alpha + "deg)",
                top:  50 + (50 * Math.sin( deg2rad( evt.beta  ))) + "%",
                left: 50 + (50 * Math.sin( deg2rad( evt.gamma ))) + "%"
            })
        })
})