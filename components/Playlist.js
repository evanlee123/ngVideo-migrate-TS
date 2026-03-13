(function Playlist($angular) {

    "use strict";

    /**
     * @property module
     * @type {Object}
     */
    var module = $angular.module('ngVideo');

    /**
     * @directive viPlaylistVideo
     * @type {Function}
     * @param ngVideoPlaylist {Array}
     * @param ngVideoOptions {Object}
     */
    module.directive('viPlaylistVideo', ['ngVideoPlaylist', 'ngVideoOptions',

    function ngPlaylistVideoDirective(ngVideoPlaylist, ngVideoOptions) {

        return {

            /**
             * @property restrict
             * @type {String}
             */
            restrict: ngVideoOptions.RESTRICT,

            /**
             * @property require
             * @type {String}
             */
            require: 'ngModel',

            /**
             * @method link
             * @param scope {Object}
             * @param element {Object}
             * @param attr {Object}
             * @param ngModel {Object}
             * @return {void}
             */
            link: function link(scope, element, attr, ngModel) {

                scope.$watch(function watchProperty() {

                    // Watch the ngModel and react once it updates.
                    return ngModel.$modelValue;

                }, function valueChanged(videoModel) {

                    element.bind('click', function onClick() {

                        scope.$apply(function apply() {

                            // Open the video when the user clicks on the item in the playlist.
                            scope.open(videoModel);

                        });

                    });

                });

            }

        }

    }]);

})(window.angular);
