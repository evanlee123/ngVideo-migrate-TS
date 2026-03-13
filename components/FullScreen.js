(function FullScreen($angular) {

    "use strict";
    /**
     * @method createFullScreenDirective
     * @param name {String}
     * @param clickFn {Function}
     * @return {Object}
     */
    var createFullScreenDirective = function createFullScreenDirective(name, clickFn) {

        /**
         * @property directiveLabel
         * @type {String}
         */
        var directiveLabel = name.charAt(0).toUpperCase() + name.slice(1);

        /**
         * @directive viFullScreenItem
         * @type {Function}
         * @param videoPlayerContext {Object} - Angular service (downgraded)
         */
        $angular.module('ngVideo').directive('viFullScreen' + directiveLabel, ['$window', 'ngVideoOptions', 'videoPlayerContext',

        function viFullScreenItem($window, ngVideoOptions, videoPlayerContext) {

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

                    element.bind('click', function onClick() {

                        // Invoke the `clickFn` callback when the element has been clicked.
                        clickFn.call(this, scope, $window.document, videoPlayerContext);
                        scope.$apply();

                    });

                }

            }

        }]);

    };

    /**
     * @directive viFullScreenOpen
     * @type {Function}
     */
    createFullScreenDirective('open', function onFullScreenOpenClick(scope, document, videoPlayerContext) {
        videoPlayerContext.openFullScreen();
    });

    /**
     * @directive viFullScreenClose
     * @type {Function}
     */
    createFullScreenDirective('close', function onFullScreenCloseClick(scope, document, videoPlayerContext) {
        videoPlayerContext.closeFullScreen();
    });

    /**
     * @directive viFullScreenToggle
     * @type {Function}
     */
    createFullScreenDirective('toggle', function onFullScreenToggleClick(scope, document, videoPlayerContext) {

        /**
         * @method inFullScreen
         * @return {Boolean}
         */
        var inFullScreen = function inFullScreen() {

            if (document.fullscreenElement) {

                // W3C.
                return !!document.fullscreenElement;

            } else if (document.mozFullscreenElement) {

                // Mozilla.
                return !!document.mozFullscreenElement;

            } else if (document.webkitFullscreenElement) {

                // Webkit.
                return !!document.webkitFullscreenElement;

            }

        };

        if (!inFullScreen()) {

            // Determine if we're currently in full-screen mode, and then deduce which method
            // to call based on the result.
            videoPlayerContext.openFullScreen();
            return;

        }

        // Close the full screen mode if we're still full screen.
        videoPlayerContext.closeFullScreen();

    });

})(window.angular);
