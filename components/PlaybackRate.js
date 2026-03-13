(function PlaybackRate($angular) {

    "use strict";

    /**
     * @method createPlaybackRateDirective
     * @param name {String}
     * @param clickFn {Function}
     * @return {Object}
     */
    var createPlaybackRateDirective = function createPlaybackRateDirective(name, clickFn) {

        /**
         * @property directiveName
         * @type {String}
         */
        var directiveName = 'viPlaybackRate' + name.charAt(0).toUpperCase() + name.slice(1);

        /**
         * @directive viPlaybackRateItem
         * @type {Function}
         * @param videoPlayerContext {Object} - Angular service (downgraded)
         * @param videoEventService {Object} - Angular service (downgraded)
         */
        $angular.module('ngVideo').directive(directiveName, ['$rootScope', 'ngVideoOptions', 'videoPlayerContext', 'videoEventService',

        function viPlaybackRateItem($rootScope, ngVideoOptions, videoPlayerContext, videoEventService) {

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

                    /**
                     * @method setPlaybackRate
                     * @param rate {Number}
                     * @return {void}
                     */
                    scope.setPlaybackRate = function setPlaybackRate(rate) {

                        var player = videoPlayerContext.player;

                        // Update the current play rate and the default play rate for when another
                        // video is played.
                        player.playbackRate        = rate;
                        player.defaultPlaybackRate = rate;

                        // Dual-emit: force refreshing of statistics
                        $rootScope.$broadcast('ng-video/feedback/refresh');
                        videoEventService.feedbackRefresh$.next();

                    };

                    element.bind('click', function onClick() {

                        // Invoke the `clickFn` callback when the element has been clicked.
                        clickFn.call(this, scope, +attributes[directiveName], +videoPlayerContext.player.playbackRate);

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
     * @directive viPlaybackRate
     * @type {Function}
     */
    createPlaybackRateDirective('', function onPlaybackRateClick(scope, directiveValue) {
        scope.setPlaybackRate(directiveValue);
    });

    /**
     * @directive viPlaybackRateNormalise
     * @type {Function}
     */
    createPlaybackRateDirective('normalise', function onPlaybackRateNormaliseClick(scope) {
        scope.setPlaybackRate(1);
    });

    /**
     * @directive viPlaybackRateIncrement
     * @type {Function}
     */
    createPlaybackRateDirective('increment', function onPlaybackRateIncrementClick(scope, directiveValue, currentRate) {
        scope.setPlaybackRate(currentRate + directiveValue);
    });

    /**
     * @directive viPlaybackRateDecrement
     * @type {Function}
     */
    createPlaybackRateDirective('decrement', function onPlaybackRateDecrementClick(scope, directiveValue, currentRate) {
        scope.setPlaybackRate(currentRate - directiveValue);
    });

})(window.angular);
