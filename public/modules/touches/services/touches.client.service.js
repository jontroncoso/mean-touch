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
]).service('TouchPoint', ['$window', '$rootScope', 'Touches', 'TouchPointField',
  function ($window, $rootScope, Touches, TouchPointField) {
    return function (options) {
      var svg = $rootScope.svg;
      var touchCoords = [$window.innerWidth * 0.01 * options.location[0], ($window.innerHeight * 0.01 * options.location[1])];
      var $this = this;
      $this.preventClick = false;

      var deactivate = function () {
        $this.point.removeClass('active')
          .selectAll('.field-group').forEach(function (touch) {
            touch.animate({transform: 't0,0'}, 500);
          });

      };


      var movePoint = function (dx, dy, posx, posy) {
        var move = this.data('origTransform') + (this.data('origTransform') ? 'T' : 't') + dx + ',' + dy;
        this.attr({
          transform: move
        });
        $this.preventClick = true;
      };
      var movePointStart = function (dx, dy, posx, posy) {
        this.data('origTransform', this.transform().local);
      };
      var movePointEnd = function (mouse) {
        var x = mouse.pageX / $window.innerWidth * 100;
        var y = mouse.pageY / $window.innerHeight * 100;

        $this.options.location = [x, y];
        var touch = Touches.get({touchId: $this.options._id}, function () {
          touch.location = $this.options.location;
          touch.$update(function () {
            console.log('SUCCESS!');
          }, function () {
            console.log('ERROR!');
          });
        });
      };


      var create = function () {
        $this.fields = [];
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

        var fieldCount = Object.keys(options.modelData).length;
        var i = 0;
        var fieldContainer = svg.group();
        for (var key in options.modelData) {
          var field = new TouchPointField({
            key: key,
            fieldCount: fieldCount,
            fieldData: options.modelData[key],
            i: i,
            touchCoords: touchCoords,
            name: options.name
          });
          $this.fields.push(field);
          fieldContainer.add(field.fieldGroup);

          i++;
        }
        group.add(fieldContainer);


        return group
          .click(activate)
          .drag(movePoint, movePointStart, movePointEnd);
      };

      var activate = function () {
        if ($this.preventClick) {
          $this.preventClick = false;
          return;
        }
        if ($this.point.hasClass('active'))return deactivate();
        $this.fields.forEach(function(field){
          field.activate();
        });
        setTimeout(function () {
          $this.point.addClass('active');
        });
      };

      this.options = options;
      this.point = create();
    };
  }
]).service('TouchPointField', ['$rootScope', function ($rootScope) {
  return function (options) {
    var svg = $rootScope.svg;
    var $this = this;
    var create = function () {
      var fieldCircle = svg.circle((options.touchCoords[0]), (options.touchCoords[1]), 15);
      var fieldTitle = svg.group(svg
          .text((options.touchCoords[0]), (options.touchCoords[1]), options.key)
      ).attr({
          id: 'field-title-' + options.key.toLowerCase(),
          class: 'field-title'
        });

      $this.fieldGroup = svg.group(fieldCircle, fieldTitle)
        .attr({class: 'field-group', id: options.name.toLowerCase() + '-field-' + options.key.toLowerCase()});
    };

    this.activate = function () {
      var degrees = 360 / options.fieldCount * options.i;
      var fieldCoords = [
        parseInt(Math.cos(degrees * (Math.PI / 180)) * ((options.fieldCount > 8 && options.i % 2 === 0) ? 75 : 50)),
        parseInt(Math.sin(degrees * (Math.PI / 180)) * ((options.fieldCount > 8 && options.i % 2 === 0) ? 75 : 50))
      ];
      var transformString = 't' + fieldCoords[0] + ',' + fieldCoords[1];
      var fieldTitle = $this.fieldGroup.select('.field-title');
      fieldTitle.attr({
        'text-anchor': (options.fieldCount <= 8 && fieldCoords[0] < 0 ? 'end' : 'start'),
        transform: 't' + (options.fieldCount <= 8 && fieldCoords[0] < 0 ? -20 : 20) + ',5'
      });
      if (options.fieldCount > 8){
        fieldTitle.attr({
          transform: 'r' + degrees + ',' + options.touchCoords[0] + ',' + options.touchCoords[1] + ((degrees > 90 && degrees < 270) ? 'r180' : '')
        });
      }

      $this.fieldGroup.animate({transform: transformString}, 500, mina.easeinout);
    };


    create();
  };
}]);