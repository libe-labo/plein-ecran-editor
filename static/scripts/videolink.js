'use strict';

$.fn.videolink = function() {
    var $container;

    $(window).on('resize', _.debounce(function() {
        if ($container != null) {
            $container.children('iframe').remove();
            $container.hide();
        }
    }, 200));

    $(this).off('click.videolink');
    $(this).on('click.videolink', function(ev) {
        var $this = $(this),
            url, i;

        if (!window.isMobile()) {
            ev.preventDefault();
            ev.stopPropagation();

            if ($container == null) {
                $container = $('<div>', { class: 'videolink-container' }).appendTo($('body'));
                $('<i>', { class: 'fa fa-close' }).click(function() {
                    $container.children('iframe').remove();
                    $container.hide();
                }).appendTo($container);
                $('<div>', { class: 'videolink-container__corner' }).appendTo($container);
            }

            $container.children('iframe').remove();

            $container.show();

            url = $this.attr('href'),
                width = parseInt(
                    ($(window).innerWidth() - $('.chapter__content').outerWidth()) / 2 -
                    ($('.exergue').last().outerWidth() * 0.70)
                ),
                height = parseInt(259 * width / 460);

            if (url === 'http://fresques.ina.fr/artsonores/fiche-media/InaGrm00208/' +
                        'la-naissance-de-la-musique-concrete-et-electro-acoustique.html') {
                url = 'https://fresques.ina.fr/artsonores/export/player/InaGrm00208/' +
                      String(width) + 'x' + String(height);
            } else if ([7, 8].indexOf(url.indexOf('www.ina.fr/video/')) >= 0) {
                url = url.substring(url.indexOf('www.ina.fr/video'))
                         .replace('www.ina.fr/video/', '').split('/')[0];
                url = 'http://player.ina.fr/player/embed/' +
                      _.last(url.split('/')) +
                      '/1/1b0bd203fbcd702f9bc9b10ac3d0fc21/' +
                      String(width) + '/' + String(height) + '/1';
            } else if ([7, 8].indexOf(url.indexOf('www.youtube.com')) >= 0) {
                url = url.split('?')[1].split('&');
                for (i = 0; i < url.length; ++i) {
                    if (url[i].indexOf('v=') === 0) {
                        url = 'https://www.youtube.com/embed/' +
                              url[i].split('=')[1] + '?rel=0&showinfo=0&autoplay=1';
                        break;
                    }
                }
            }

            $container.append($('<iframe>', {
                class: 'bottomright',
                frameborder: 0,
                height: height + 5,
                marginwidth: 0,
                marginheight: 0,
                scrolling: 0,
                src: url,
                width: width + 5
            }));

            $('.videolink-container__corner').css({
                'border-bottom-width': $container.outerHeight(),
                'border-left-width': $container.outerHeight()
            });
        }
    });
};
