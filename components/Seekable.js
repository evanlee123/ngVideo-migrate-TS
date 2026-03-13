(function Seekable($angular) {

    "use strict";

    /**
     * @method createSeekableDirective
     * @param name {String}
     * @param clickFn {Function}
     * @return {Object}
     */
    var createSeekableDirective = function createSeekableDirective(name, clickFn) {

        /**
         * @property directiveName
         * @type {String}
         */
        var directiveName = 'viSeekable' + name.charAt(0).toUpperCase() + name.slice(1);

        /**
         * @directive viSeekableItem
         * @type {Function}
         * @param videoPlayerContext {Object} - Angular service (downgraded)
         * @param videoEventService {Object} - Angular service (downgraded)
         */
        $angular.module('ngVideo').directive(directiveName, ['$rootScope', 'ngVideoOptions', 'videoPlayerContext', 'videoEventService',

        function viSeekableItem($rootScope, ngVideoOptions, videoPlayerContext, videoEventService) {

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
                 * @param attributes {Object}
                 * @return {void}
                 */
                link: function link(scope, element, attributes) {

                    element.bind('click', function onClick() {

                        // Invoke the `clickFn` callback when the element has been clicked.
                        clickFn.call(this, scope, +attributes[directiveName], +videoPlayerContext.player.currentTime);

                        // Dual-emit: force the timeline directive to update
                        $rootScope.$broadcast('ng-video/feedback/refresh');
                        videoEventService.feedbackRefresh$.next();
                        scope.$apply();

                    });

                }

            }

        }]);

    };

    /**
     * @directive viSeekable
     * @type {Function}
     */
    createSeekableDirective('', function onTimeClick(scope, directiveValue) {
        scope.player.currentTime = directiveValue;
    });

    /**
     * @directive viSeekableIncrement
     * @type {Function}
     */
    createSeekableDirective('increment', function onIncrementClick(scope, directiveValue, currentTime) {
        scope.player.currentTime = currentTime + directiveValue;
    });

    /**
     * @directive viSeekableDecrement
     * @type {Function}
     */
    createSeekableDirective('decrement', function onDecrementClick(scope, directiveValue, currentTime) {
        scope.player.currentTime = currentTime - directiveValue;
    });

})(window.angular);
