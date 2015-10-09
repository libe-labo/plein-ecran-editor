'use strict';

$(function() {
    var covers = [
        // {
        //     idxs : [2000, 2007],
        //     mode : 'loop',
        //     time : 100,
        //     delay : 1000,
        //     $ : undefined
        // },
        {
            idxs : [700, 713],
            mode : 'backandforth',
            time : 100,
            delay : 500,
            $ : undefined
        },
        {
            idxs : [402, 411],
            mode : 'loop',
            time : 200,
            delay : 1000,
            $ : undefined
        },
        {
            idxs : [311, 330],
            mode : 'loop',
            time : 100,
            delay : 100,
            $ : undefined
        },
        {
            idxs : [508, 522],
            mode : 'loop',
            time : 100,
            delay : 200,
            $ : undefined
        }
    ];

    var resizeCover = function() {
        $(this).css('height', parseInt($(window).innerHeight() * 0.80));
    };

    $(window).on('resize', _.debounce(function() {
        $('.chapter__cover').each(function(idx) {
            if (covers[idx] != null) {
                resizeCover.bind(this)();
            }
        });
    }, 200));

    $('.chapter__cover').each(function(idx) {
        if (covers[idx] != null) {
            var $this = $(this),
                toLoad = covers[idx].idxs[1] - covers[idx].idxs[0],
                loaded = 0;

            resizeCover.bind(this)();

            var update = (function() {
                var currentIdx = covers[idx].idxs[0],
                    direction = 1,
                    timer,
                    last, lastTime;

                var ret = function() {
                    covers[idx].$ = $this;

                    var time = covers[idx].time,
                        now = Date.now();

                    if (last != null && lastTime != null) {
                        if (now - last > lastTime * 2) {
                            // Too much lag, we're stopping animations
                            return;
                        }
                    }

                    $this.find('.chapter__cover').removeClass('active');
                    $this.find('.chapter__cover[rel="' + currentIdx + '"]').addClass('active');

                    currentIdx += direction;
                    if (currentIdx >= covers[idx].idxs[1] || currentIdx < covers[idx].idxs[0]) {
                        if (covers[idx].mode === 'backandforth') {
                            // Back in the other direction
                            direction = -direction;
                            currentIdx += direction * 2;
                        } else if (covers[idx].mode === 'loop') {
                            // Back to the beginning
                            currentIdx = covers[idx].idxs[0];
                        } else if (covers[idx].mode === 'one') {
                            // Aaaaaand, we're done
                            return;
                        }
                        time = covers[idx].delay;
                    }

                    timer = setTimeout(update, time);

                    last = now;
                    lastTime = time;
                };

                ret.cancel = function() {
                    clearTimeout(timer);
                    timer = last = lastTime = null;
                };

                ret.isPlaying = function() {
                    return timer !== null;
                };

                return ret;
            })();

            $this.data('update', update);

            // LOAD EVERYTHING o/
            (function() {
                var loadImage = function(idx, callback) {
                    // Some simple 'fake' preload
                    var image = new Image();
                    image.onload = function() {
                        if (callback != null) {
                            callback(image);
                        }
                    };
                    image.src = 'static/upload/Sequence%200' + String(idx) + '.jpg';
                };

                loadImage(covers[idx].idxs[1], function() {
                    $this.css({
                        'background-image': 'url(static/upload/Sequence%200' +
                                            String(covers[idx].idxs[1]) + '.jpg)'
                    });
                    if (window.isMobile()) { return; }
                    for (var i = covers[idx].idxs[0]; i < covers[idx].idxs[1]; ++i) {
                        loadImage(i, (function(i) {
                            return function(image) {
                                // Append element used to play the animation
                                $this.append(
                                    $('<div>', {
                                        src: image.src,
                                        class: 'chapter__cover' +
                                               (i === covers[idx].idxs[0] ? ' active' : ''),
                                        rel: i
                                    }).css({
                                        'background-image': 'url(' + image.src + ')'
                                    })
                                );

                                if (++loaded >= toLoad) {
                                    update();
                                }
                            };
                        })(i));
                    }
                });
            })();

        }
    });

    if (!window.isMobile()) {
        $(window).on('scroll', _.debounce(function() {
            _.each(covers, function(cover, i) {
                if (cover.$ == null) { return; }
                var windowTop = $(window).scrollTop(),
                    windowBottom = windowTop + $(window).innerHeight(),
                    top = cover.$.offset().top,
                    bottom = top + cover.$.outerHeight(),
                    $animation = cover.$.data('update');

                if ($animation.isPlaying()) {
                    if (bottom < windowTop || top > windowBottom) {
                        $animation.cancel();
                    }
                } else {
                    if (bottom >= windowTop && top <= windowBottom) {
                        $animation();
                    }
                }
            });
        }, 200));

        $(window).on('focus', function() {
            $(window).trigger('scroll');
        });
    }
});
