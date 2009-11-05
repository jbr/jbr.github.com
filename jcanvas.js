var $ctx
$(function(){
  $ctx = $('canvas').get(0).getContext('2d');
  $.extend($ctx, {
    getColor: function(options) {
      if (typeof options == "string") {
        return options;
      } else if (options && options.red && options.green && options.blue && options.alpha) {
        return 'rgba('+
          Math.max(255, Math.floor(options.red * 255))+', '+
          Math.max(255, Math.floor(options.green * 255))+', '+
          Math.max(255, Math.floor(options.blue * 255))+', '+
          Math.max(1,options.alpha)+')';
      } else {
        return 'black'
      }
    },
    
    draw: function(options, fn) {
      $ctx.beginPath();
      
      fn.call();
      
      if (options.fill) {
        $ctx.fillStyle = $ctx.getColor(options.fill)
        $ctx.fill();
      }

      
      $ctx.strokeStyle = $ctx.getColor(options.stroke)
      $ctx.stroke();
    },
    
    shapes: {
      button: $.extend(function(options){
        $ctx.shapes.rectangle(options);
      }, {
        click: function(options, location) {
          if ( options.click &&
            Math.abs(location.x - options.x) <= options.width/2.0 &&
            Math.abs(location.y - options.y) <= options.height/2.0 ) {
            
            options.click();
          }
        }
      }),
      
      rectangle: function(options) {
        $ctx.draw(options, function(){
          if (options.width == undefined) options.width = 20;
          if (options.height == undefined) options.height = options.width;
          $ctx.rect(
            options.x - options.width/2.0,
            options.y - options.height/2.0,
            options.width,
            options.height
          )
        });
      },
      
      followCircle: function(options) {
        if ($ctx.mouse) {
          distance = $ctx.distance($ctx.mouse, options);
          $.extend(options, {
            x: options.x + (Math.pow(distance/100, 2)) * ($ctx.mouse.x - options.x) / 100.0,
            y: options.y + (Math.pow(distance/100, 2)) * ($ctx.mouse.y - options.y) / 100.0,
            radius: distance > 1 ? distance / 10 : 1,
            alpha: 1
          });
        }
        $ctx.shapes.circle(options)
      },
      
      rainbowCircle: function(options) {
        if (options.created) {
          now = (new Date()).getTime();
          diff = now - options.created;
          $.extend(options, {
            fill: {
              alpha: (Math.sin(diff/1000.0) / 6.0) + 0.5,
              green: (Math.sin(diff/300.0) / 2.0) + 0.5,
              blue: (Math.sin(diff/200.0) / 2.0) + 0.5,
              red: (Math.sin(diff/500.0) / 2.0) + 0.5
            }
          })
        }
        
        $ctx.shapes.circle(options);
      },
    
      circle: function(options) {
        if(options.x && options.y) {
          $ctx.draw(options, function(){
            $ctx.arc(options.x,  options.y, (options.radius || 20), 0, Math.PI*2, false);
          })
        }
      }
    },
    
    paintAll: function() {
      $ctx.clearRect(0, 0, $ctx.width, $ctx.height)
      $.each(this.objects, function(){
        $ctx.shapes[this.type](this.data);
      })
      
      // if(this.mouse) {this.shapes.circle(this.mouse)}
    },
    
    animate: function(timeout, adaptive, showFPS){
      $ctx.startedAt = $ctx.startedAt || (new Date()).getTime();
      $ctx.framesPainted = $ctx.framesPainted + 1 || 1

      adaptive = typeof adaptive === 'undefined' || adaptive
      showFPS = typeof showFPS === 'undefined' || showFPS

      $ctx.paintAll();
      
      timeout = timeout || 50;

      if ($ctx.framesPainted > 10) {
        fps = $ctx.framesPainted / ((new Date()).getTime() - $ctx.startedAt) * 1000;
        if (adaptive) { timeout = (timeout + (1000 / fps))/2.0 - 2; }
        if (showFPS) {
          $ctx.fillStyle = "black"
          $ctx.font = "15pt Arial"
          $ctx.fillText(Math.round(fps * 10)/10 + " f/s", 10, 25)
          $ctx.fillText('timeout '+Math.round(timeout * 10)/10 + "s", 10, 50)
        }
      }
      
      $ctx.animate.timeout = setTimeout(function(){$ctx.animate(timeout, adaptive, showFPS)}, timeout);
    },
    
    objects: [],
    clickables: [],
    namedObjects: [],
    
    addObject: function(object) {
      object.data.created = (new Date()).getTime();
      $ctx.objects.push(object);
      if ($ctx.shapes[object.type].click) $ctx.clickables.push(object);
      return object;
    },
    
    distance: function(point1, point2) {
      if(point1 == undefined || point2 == undefined) return 0;
      if(point1.x == undefined && point1.y == undefined && point1.data) {point1 = point1.data}
      if(point2.x == undefined && point2.y == undefined && point2.data) {point2 = point2.data}
      return Math.sqrt(Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2));
    },
    
    eventToPoint: function(e)  {
      return {
        x: e.clientX - $('canvas').position().left,
        y: e.clientY - $('canvas').position().top
      }
    },
    
    handleClick: function(location) {
      $.each($ctx.clickables, function(){
        $ctx.shapes[this.type].click(this.data, location);
      })
    }
  });
});
 
