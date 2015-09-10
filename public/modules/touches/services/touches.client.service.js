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
    return function () {
      var $this = this;
      $this.touchPoints = [];
      $rootScope.svg = new Snap('#touch-svg');

      this.setPoints = function (touches) {
        touches.forEach(function (touch) {
          $this.touchPoints.push(new TouchPoint(touch));
        });
        return $this;
      };
    };
  }
]).service('TouchPoint', ['$window', '$rootScope', 'Touches',
  function ($window, $rootScope, Touches) {
    return function (options) {
      var svg = $rootScope.svg;
      var touchCoords = [$window.innerWidth * 0.01 * options.location[0], ($window.innerHeight * 0.01 * options.location[1])];
      var $this = this;
      $this.preventClick = false;

      var deactivate = function () {
        console.log('sssss: %o', $this.point.selectAll('.field-group'));
        $this.point.removeClass('active')
          .selectAll('.field-group').forEach(function(touch) {
            touch.animate({transform: 't0,0'}, 500, function(){
              this.remove();
            });
          });

      };
      var activate = function () {
        console.log('$this.preventClick: %o', $this.preventClick);
        if ($this.point.hasClass('active'))return deactivate();
        if ($this.preventClick) {
          $this.preventClick = false;
          return;
        }
        var fieldCount = Object.keys(options.modelData).length;
        var i = 0;
        var fieldContainer = svg.group();
        for (var key in options.modelData) {
          var degrees = 360 / fieldCount * i;
          var fieldCoords = [parseInt(Math.cos(degrees * (Math.PI / 180)) * 50), parseInt(Math.sin(degrees * (Math.PI / 180)) * 50)];
          var field = options.modelData[key];
          var fieldCircle = svg.circle((touchCoords[0]), (touchCoords[1]), 15);
          var fieldTitle = svg.group(svg
              .text((touchCoords[0]), (touchCoords[1]), key)
              .attr({
                'text-anchor': (fieldCoords[0] > 0 ? 'start' : 'end'),
                transform: 't' + (fieldCoords[0] > 0 ? 20 : -20) + ',0'
              })
          )
            .attr({
              id: 'field-title-' + key.toLowerCase(),
              class: 'field-title'
            });
          var transformString = 't' + fieldCoords[0] + ',' + fieldCoords[1];
          var fieldGroup = svg.group(fieldCircle, fieldTitle)
            .attr({class: 'field-group', id: options.name.toLowerCase() + '-field-' + key.toLowerCase()})
            .animate({transform: transformString}, 500, mina.easeinout);
          fieldContainer.add(fieldGroup);
          i++;
          console.log('%o : degrees: %o | x: %o | y: %o', key, degrees, Math.cos(degrees), Math.sin(degrees));
        }
        $this.point.add(fieldContainer).addClass('active');
      };

      var movePoint = function (dx, dy, posx, posy) {
        var move = this.data('origTransform') + (this.data('origTransform') ? 'T' : 't') + dx + ',' + dy;
        this.attr({
          transform: move
        });
        $this.preventClick = true;
      };
      var movePointStart = function (dx, dy, posx, posy) {
        console.log('Started!');
        this.data('origTransform', this.transform().local);
      };
      var movePointEnd = function (mouse) {
        var x = mouse.clientX / document.getElementById('touch-svg').clientWidth * 100;
        var y = mouse.clientY / document.getElementById('touch-svg').clientHeight * 100;

        console.log('Ended! %o | [%o, %o] | W[%o, %o], BB: %o', mouse, x, y, $window.innerWidth, $window.innerHeight, document.getElementById('touch-svg').clientWidth);
        $this.options.location = [x, y];
        //$rootScope.$broadcast('touchPoint:update', $this.options);
        var touch = Touches.get({touchId: $this.options._id}, function () {
          console.log('TT: %o', $this);
          touch.location = $this.options.location;
          touch.$update(function () {
            console.log('SUCCESS!');
          }, function () {
            console.log('ERROR!');
          });
          console.log('T: %o', touch);
        });
      };


      var create = function () {
        var circle = svg.circle((touchCoords[0]), (touchCoords[1]), 15).attr({
          id: 'base-' + options.name,
          class: 'base'
        });
        var title = svg.group(svg.text((touchCoords[0]), (touchCoords[1] - 20), options.name).attr({'text-anchor': 'middle'}))
          .attr({
            id: 'title-' + options.name.toLowerCase(),
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