(function Volume($angular) {

    "use strict";

    /**
     * @property module
     * @type {Object}
     */
    var module = $angular.module('ngVideo');

    /**
     * @method createVolumeDirective
     * @param name {String}
     * @param clickFn {Function}
     * @return {Object}
     */
    var createVolumeDirective = function createVolumeDirective(name, clickFn) {

        /**
         * @property directiveLabel
         * @type {String}
         */
        var directiveLabel = name.charAt(0).toUpperCase() + name.slice(1);

        /**
         * @directive viVolumeItem
         * @type {Function}
         */
        module.directive('viVolume' + directiveLabel, ['ngVideoOptions', 'videoPlayerContext', 'videoEventService',

        function viVolumeItem(ngVideoOptions, videoPlayerContext, videoEventService) {

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

                        var player = videoPlayerContext.player;
                        var currentVolume = player ? player.volume : 0;

                        // Invoke the `clickFn` callback when the element has been clicked.
                        clickFn.call(this, videoPlayerContext, videoEventService, currentVolume, ngVideoOptions.VOLUME_STEPS);
                        scope.$apply();

                    });

                }

            }

        }]);

    };

    /**
     * @directive viVolumeDecrease
     * @type {Function}
     */
    createVolumeDirective('decrease', function onDecreaseClick(ctx, events, currentVolume, volumeSteps) {
        ctx.setVolume(currentVolume - volumeSteps);
        events.volumeChanged$.next(ctx.player ? ctx.player.volume : 0);
    });

    /**
     * @directive viVolumeIncrease
     * @type {Function}
     */
    createVolumeDirective('increase', function onIncreaseClick(ctx, events, currentVolume, volumeSteps) {
        ctx.setVolume(currentVolume + volumeSteps);
        events.volumeChanged$.next(ctx.player ? ctx.player.volume : 0);
    });

    /**
     * @directive viVolumeMute
     * @type {Function}
     */
    createVolumeDirective('mute', function onMuteClick(ctx, events) {
        ctx.setVolume(0);
        events.volumeChanged$.next(0);
    });

    /**
     * @directive viVolumeLoudest
     * @type {Function}
     */
    createVolumeDirective('loudest', function onLoudestClick(ctx, events) {
        ctx.setVolume(1);
        events.volumeChanged$.next(ctx.player ? ctx.player.volume : 1);
    });

})(window.angular);
