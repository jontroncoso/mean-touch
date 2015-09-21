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
]).service('TouchManager', ['$window', '$rootScope', 'TouchPoint', 'TouchPointReference',
  function ($window, $rootScope, TouchPoint, TouchPointReference) {
    return function (touches) {
      var $this = this;
      $this.touchPoints = {};
      $rootScope.svg = new Snap('#touch-svg');

      var createPoints = function () {
        touches.forEach(function (touch) {
          $this.touchPoints[touch.name] = (new TouchPoint(touch));
        });
      };
      var createReferences = function () {
        touches.forEach(function (touch) {
          for (var key in touch.modelData) {
            var field = touch.modelData[key];
            if (field.options.ref) {
              //console.log('REF! %o | %o', $this.touchPoints[field.options.ref], $this.touchPoints[touch.name].fields[field.options.ref.toLowerCase()]);
              new TouchPointReference($this.touchPoints[field.options.ref], $this.touchPoints[touch.name].fields[field.options.ref.toLowerCase()]);
            }
          }
        });
      };
      createPoints();
      createReferences();
    };
  }
]).service('TouchPoint', ['$window', '$rootScope', 'Touches', 'TouchPointField',
  function ($window, $rootScope, Touches, TouchPointField) {
    return function (options) {
      var svg = $rootScope.svg;
      var touchCoords = [parseInt($window.innerWidth * 0.01 * options.location[0]), parseInt($window.innerHeight * 0.01 * options.location[1])];
      var $this = this;
      var references = [];
      var preventClick = false;
      this.fields = {};


      var deactivate = function () {
        $this.point.removeClass('active')
          .selectAll('.field-group').forEach(function (touch) {
            touch.animate({transform: 't0,0'}, 500);
          });

        references.foreach(function (reference) {
          //reference.moveLine($this, )
        });
      };


      var movePoint = function (dx, dy, posx, posy) {
        var move = this.data('origTransform') + (this.data('origTransform') ? 'T' : 't') + dx + ',' + dy;
        this.attr({
          transform: move
        });
        var bBox = this.select('circle.base').getBBox();
        console.log('DX: %o | DY: %o || BB: [%o,%o]', dx, dy, bBox.cx, bBox.cy);
        var identifier = this.attr('id');
        preventClick = true;
        references.forEach(function (reference) {
          reference.moveLine(identifier, dx, dy);
        });
      };
      var movePointStart = function (dx, dy, posx, posy) {
        this.data('origTransform', this.transform().local);
      };
      var movePointEnd = function (mouse) {
        var x = mouse.pageX / $window.innerWidth * 100;
        var y = mouse.pageY / $window.innerHeight * 100;

        options.location = [x, y];
        var touch = Touches.get({touchId: options._id}, function () {
          touch.location = options.location;
          touch.$update(function () {
            console.log('SUCCESS!');
          }, function () {
            console.log('ERROR!');
          });
        });
        references.forEach(function (reference) {
          reference.moveStopLine();
        });
      };


      var create = function () {
        $this.fields = {};
        var circle = svg.circle((touchCoords[0]), (touchCoords[1]), 15).attr({
          id: 'base-' + options.name,
          class: 'base'
        });
        var title = svg.group(svg.text((touchCoords[0]), (touchCoords[1] - 20), options.name).attr({'text-anchor': 'middle'}))
          .attr({
            id: 'title-' + options.name.toLowerCase(),
            class: 'title'
          });
        var group = svg.group(circle, title).attr({id: $this.identifier, class: 'group'});
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
            name: options.name,
            touchPoint: $this
          });
          $this.fields[key] = field;
          fieldContainer.add(field.fieldGroup);

          i++;
        }
        group.add(fieldContainer);

        return group
          .click(activate)
          .drag(movePoint, movePointStart, movePointEnd);
      };

      var activate = function () {
        if (preventClick) {
          preventClick = false;
          return;
        }
        if ($this.point.hasClass('active'))return deactivate();
        for (var key in $this.fields) {
          $this.fields[key].activate();
        }
        //$this.fields.forEach(function (field) {
        //  field.activate();
        //});
        $this.point.addClass('active');
      };

      this.addReference = function (reference) {
        references.push(reference);
      };
      this.coords = function () {
        console.log(touchCoords);
        return touchCoords;
      };
      this.identifier = 'group-' + options.name.toLowerCase();
      this.point = create();
    };
  }
]).service('TouchPointField', ['$rootScope', function ($rootScope) {
  return function (options) {
    var svg = $rootScope.svg;
    var $this = this;
    var references = [];
    var fieldCoords = [0, 0];

    var create = function () {
      var fieldCircle = svg.circle((options.touchCoords[0]), (options.touchCoords[1]), 15);
      var fieldTitle = svg.group(svg.text((options.touchCoords[0]), (options.touchCoords[1]), options.key))
        .attr({
          id: 'field-title-' + options.key.toLowerCase(),
          class: 'field-title'
        });

      return svg.group(fieldCircle, fieldTitle)
        .attr({class: 'field-group', id: options.name.toLowerCase() + '-field-' + options.key.toLowerCase()});
    };
    this.activate = function () {
      var degrees = 360 / options.fieldCount * options.i;
      fieldCoords = [
        parseInt(Math.cos(degrees * (Math.PI / 180)) * ((options.fieldCount > 8 && options.i % 2 === 0) ? 75 : 50)),
        parseInt(Math.sin(degrees * (Math.PI / 180)) * ((options.fieldCount > 8 && options.i % 2 === 0) ? 75 : 50))
      ];
      var transformString = 't' + fieldCoords[0] + ',' + fieldCoords[1];
      var fieldTitle = $this.fieldGroup.select('.field-title');
      fieldTitle.attr({
        'text-anchor': (options.fieldCount <= 8 && fieldCoords[0] < 0 ? 'end' : 'start'),
        transform: 't' + (options.fieldCount <= 8 && fieldCoords[0] < 0 ? -20 : 20) + ',5'
      });
      if (options.fieldCount > 8) {
        fieldTitle.attr({
          transform: 'r' + degrees + ',' + options.touchCoords[0] + ',' + options.touchCoords[1] + ((degrees > 90 && degrees < 270) ? 'r180' : '')
        });
      }

      $this.fieldGroup.animate({transform: transformString}, 500, mina.easeinout);
    };
    this.addReference = function (reference) {
      references.push(reference);
      options.touchPoint.addReference(reference);
    };
    this.coords = function () {
      console.log(fieldCoords);
      //var touchCoords = [options.touchCoords[0]+fieldCoords[0],options.touchCoords[1]+fieldCoords[1]];
      return [options.touchCoords[0] + fieldCoords[0], options.touchCoords[1] + fieldCoords[1]];
    };
    this.collectionName = function () {
      return options.touchPoint;
    };
    this.fieldGroup = create();
    this.touchPoint = options.touchPoint;
  };
}]).service('TouchPointReference', ['$rootScope', function ($rootScope) {
  return function (collection, field) {
    console.log('F: %o, C: %o', field, collection);
    var $this = this;
    var svg = $rootScope.svg;
    var touchMap = {};
    var fieldCoords = field.coords();
    var touchCoords = collection.coords();
    touchMap[field.touchPoint.identifier] = 'field';
    touchMap[collection.identifier] = 'collection';
    var create = function () {
      console.log('FC: %o | tc: %o', fieldCoords, touchCoords);
      field.addReference($this);
      collection.addReference($this);
      return svg.line(fieldCoords[0], fieldCoords[1], touchCoords[0], touchCoords[1])
        .attr({strokeWidth: 5, stroke: 'black', strokeLinecap: 'round'});
    };

    this.moveLine = function (identifier, dx, dy) {
      var selected;
      if (touchMap[identifier] === 'field') {
        selected = field;
        line.attr({x1: fieldCoords[0] + dx, y1: fieldCoords[1] + dy});
      }
      else if (touchMap[identifier] === 'collection') {
        selected = collection;
        line.attr({x2: touchCoords[0] + dx, y2: touchCoords[1] + dy});
      }
      else {
        selected = null;
      }
      console.log('Sel: %o | TP: %o [%o,%o]', selected, identifier, dx, dy);
      //$this.attr({x1: ,x2: , y1: ,y2: });
    };
    this.moveStopLine = function () {
      fieldCoords = [parseInt(line.attr('x1')), parseInt(line.attr('y1'))];
      touchCoords = [parseInt(line.attr('x2')), parseInt(line.attr('y2'))];
    };
    console.log('TM: %o', touchMap);

    var line = create();
  };
}]);