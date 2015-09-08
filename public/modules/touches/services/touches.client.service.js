'use strict';

//Touches service used to communicate Touches REST endpoints
angular.module('touches').factory('Touches', ['$resource',
  function ($resource) {
    return $resource('touches/:touchId', {
      touchId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]).service('TouchPoints', ['$window', '$rootScope', 'TouchPoint',
  function ($window, $rootScope, TouchPoint) {
    var $touchRoot = this;
    $touchRoot.touchPoints = [];
    $rootScope.svg = new Snap('#touch-svg');

    this.setPoints = function (touches) {
      touches.forEach(function (touch) {
        $touchRoot.touchPoints.push(new TouchPoint(touch));
      });
      return this;
    };

  }
]).service('TouchPoint', ['$window', '$rootScope',
  function ($window, $rootScope) {
    return function (options) {
      var svg = $rootScope.svg;
      var size = [$window.innerWidth * 0.01 * options.location[0], ($window.innerHeight * 0.01 * options.location[1])];
      var $this = this;

      var activate = function () {
        if($this.point.hasClass('active'))return;
        var fieldCount = Object.keys(options.modelData).length;
        var i = 0;
        var fieldContainer = svg.group();
        for (var key in options.modelData) {
          var degrees = 360/fieldCount*i;
          var coords = [parseInt(Math.cos(degrees*(Math.PI / 180))*50), parseInt(Math.sin(degrees*(Math.PI / 180))*50)];
          var field = options.modelData[key];
          var fieldCircle = svg.circle((size[0]), (size[1]), 15).attr({id: options.name + '-field-' + key});
          var fieldTitle = svg.group(svg
            .text((size[0]), (size[1]), key)
            .attr({'text-anchor': (coords[0] > 0 ? 'start' : 'end'), transform: 't' + (coords[0] > 0 ? 20 : -20) + ',0'})
          )
          .attr({
            id: 'field-title-' + key,
            class: 'field-title'
          });
          var transformString = 't' + coords[0] + ',' + coords[1];
          var fieldGroup = svg.group(fieldCircle, fieldTitle)
            .animate({transform: transformString}, 500, mina.easeinout);
          fieldContainer.add(fieldGroup);
          i++;
          console.log('%o : degrees: %o | x: %o | y: %o', key, degrees, Math.cos(degrees), Math.sin(degrees));
        }
        $this.point.add(fieldContainer).addClass('active');
      };

      var movePoint = function (dx, dy, posx, posy) {
        var move = this.data('origTransform') + (this.data('origTransform') ? 'T' : 't') + dx + ',' + dy;
        console.log(this, posx, posy, move);
        //this.attr( { x: posx , y: posy } ); // basic drag, you would want to adjust to take care of where you grab etc.
        this.attr({
          transform: move
        });

      };
      var movePointStart = function (dx, dy, posx, posy) {
        console.log('Started!');
        this.data('origTransform', this.transform().local );
      };
      var movePointEnd = function()
      {
        console.log('Ended!');
      };


      var create = function () {
        var circle = svg.circle((size[0]), (size[1]), 15).attr({id: 'base-' + options.name, class: 'base'});
        var title = svg.group(svg.text((size[0]), (size[1] - 20), options.name).attr({'text-anchor': 'middle'}))
          .attr({
            id: 'title-' + options.name,
            class: 'title'
          });
        var group = svg.group(circle, title).attr({id: 'group-' + options.name, class: 'group'});

        return group
          .click(activate)
          .drag(movePoint, movePointStart, movePointEnd);
      };

      this.options = options;
      this.point = create();
    };
  }
]);