angular.module('meshApp').factory('httpInterceptor', function httpInterceptor ($q, $window, $location) {
    return {
        'responseError': function(rejection) {
            console.log("foda-se", rejection);

            if (rejection.status === 401) {
                $location.url('/login');
            }

            if (rejection.status === 404) {
                $location.url('/404');
            }

            return $q.reject(rejection);
        }
    };
});