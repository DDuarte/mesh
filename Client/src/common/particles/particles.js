function pJS_desktop() {
    particlesJS('particles-js', {
        particles: {
            color: '#fff',
            shape: 'circle',
            opacity: 1,
            size: 2.5,
            size_random: true,
            nb: 150,
            line_linked: {
                enable_auto: true,
                distance: 250,
                color: '#fff',
                opacity: 0.5,
                width: 1,
                condensed_mode: {
                    enable: false,
                    rotateX: 600,
                    rotateY: 600
                }
            },
            anim: {
                enable: true,
                speed: 3
            }
        },
        interactivity: {
            enable: true,
            mouse: {
                distance: 200
            },
            detect_on: 'canvas',
            mode: 'grab',
            line_linked: {
                opacity: 0.5
            },
            events: {
                onclick: {
                    enable: true,
                    mode: 'push',
                    nb: 4
                }
            }
        },
        retina_detect: true
    });
}

/* MOBILE / TABLET */

function pJS_mobile() {
    particlesJS('particles-js', {
        particles: {
            color: '#fff',
            shape: 'circle',
            opacity: 1,
            size: 2.5,
            size_random: true,
            nb: 40,
            line_linked: {
                enable_auto: false,
                distance: 250,
                color: '#fff',
                opacity: 0.5,
                width: 1,
                condensed_mode: {
                    enable: false,
                    rotateX: 600,
                    rotateY: 600
                }
            },
            anim: {
                enable: true,
                speed: 3
            }
        },
        interactivity: {
            enable: false,
            mouse: {
                distance: 200
            },
            detect_on: 'canvas',
            mode: 'grab',
            line_linked: {
                opacity: 0.5
            },
            events: {
                onclick: {
                    enable: true,
                    mode: 'push',
                    nb: 4
                }
            }
        },
        retina_detect: true
    });
}

angular.module('meshApp').factory('particles', function () {
    return {
        init: function() {
            if(window.innerWidth > 1100) {
                pJS_desktop();
            } else {
                pJS_mobile();
            }

            window.addEventListener('resize', function() {
                checkOnResize();
            }, true);

            function checkOnResize() {
                if (window.innerWidth > 1100) {
                    if (pJS.particles.nb != 150) {
                        pJS.fn.vendors.destroy();
                        pJS_desktop();
                    }
                } else {
                    if (pJS.particles.nb == 150) {
                        pJS.fn.vendors.destroy();
                        pJS_mobile();
                    }
                }
            }
        }
    };
});
