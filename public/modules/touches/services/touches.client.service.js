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
        $this.point.addClass('active');
        for (var key in options.modelData) {
          var field = options.modelData[key];
          var fieldCircle = svg.circle((size[0]), (size[1]), 15).attr({id: options.name + '-field-' + key});
          var fieldTitle = svg.group(svg.text((size[0]) + 20, (size[1]), key).attr({'text-anchor': 'middle'})).attr({
            id: 'field-title-' + key,
            class: 'field-title'
          });

          console.log(field);
        }
      };

      var create = function () {
        var circle = svg.circle((size[0]), (size[1]), 15).attr({id: 'base-' + options.name, class: 'base'});
        var title = svg.group(svg.text((size[0] + 20), (size[1] + 5), options.name).attr({'text-anchor': 'left'})).attr({
          id: 'title-' + options.name,
          class: 'title'
        });

        var group = svg.group(circle, title).attr({id: 'group-' + options.name, class: 'group'});

        return group
          .click(activate);
      };

      this.options = options;
      this.point = create();
    };
  }
]);