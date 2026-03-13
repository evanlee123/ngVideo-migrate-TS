(function Screen($angular) {

    "use strict";

    /**
     * @directive viScreen
     * @type {Function}
     * @param ngVideoOptions {Object}
     * @param videoPlayerContext {Object} - Angular service (downgraded)
     */
    $angular.module('ngVideo').directive('viScreen', ['ngVideoOptions', 'videoPlayerContext',

    function ngScreenDirective(ngVideoOptions, videoPlayerContext) {

        return {

            /**
             * @property restrict
             * @type {String}
             */
            restrict: ngVideoOptions.RESTRICT,

            /**
             * @method link
             * @param scope {Object}
             * @param element {Object}
             * @return {void}
             */
            link: function link(scope, element) {

                if (ngVideoOptions.SCREEN_CHANGE) {

                    // When the video player screen is clicked, we'll toggle the playing
                    // state of the current video, if there is one.
                    element.bind('click', function() {

                        if (!videoPlayerContext.loading$.value) {
                            videoPlayerContext.toggleState();
                        }

                    });

                }

            }

        }

    }]);

})(window.angular);
