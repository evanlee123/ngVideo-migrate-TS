(function Controls($angular) {

    "use strict";

    /**
     * @property module
     * @type {Object}
     */
    var module = $angular.module('ngVideo');

    /**
     * List of actions that are available on the video player.
     *
     * @property actions
     * @type {String[]}
     */
    var actions = ['play', 'pause'];

    /**
     * @method createControlDirective
     * @param name {String}
     * @return {Object}
     */
    var createControlDirective = function createControlDirective(name) {

        /**
         * @property directiveLabel
         * @type {String}
         */
        var directiveLabel = name.charAt(0).toUpperCase() + name.slice(1);

        /**
         * @directive viControlsItem
         * @type {Function}
         */
        module.directive('viControls' + directiveLabel, ['ngVideoOptions', 'videoPlayerContext',

        function viControlsItem(ngVideoOptions, videoPlayerContext) {

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
                        videoPlayerContext[name]();
                        scope.$apply();
                    });

                }

            }

        }]);

    };

    // Attach all of our control item directives.
    $angular.forEach(actions, function forEach(actionName) {
        createControlDirective(actionName);
    });

})(window.angular);
