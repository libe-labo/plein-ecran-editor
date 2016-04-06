/* global CSSMediaRule: false, skrollr: false */
'use strict';

$(function() {
    var resizeCovers = function() {
        $('.chapter__cover').css('height', $(window).innerHeight());
    };

    var updateCoverTitles = function() {
        [].slice.call(document.querySelectorAll('.chapter__content')).forEach(function(chapter) {
            var title = chapter.querySelector('.cover-title'), clonedTitle, cover;
            if (title != null) {
                cover = chapter.parentNode.querySelector('.chapter__cover');

                title.style.display = 'block';
                clonedTitle = title.cloneNode(true);
                title.style.display = 'none';

                [].slice.call(cover.querySelectorAll('.cover-title')).forEach(function(title) {
                    title.remove();
                });

                cover.appendChild(clonedTitle);
            }
        });
    };

    $(window).on('resize', _.debounce(resizeCovers, 200));

    window.paulloz = { afterUpdateChapterLink: $.noop, afterResetComponents: $.noop };

    // Check the first @media query present in our stylesheets to know if we're on a mobile or not
    window.isMobile = function() {
        var i, j, mediaText;

        for (j = 0; j < document.styleSheets.length; ++j) {
            if (document.styleSheets[j] == null ||
                document.styleSheets[j].href == null) { continue; }

            if (document.styleSheets[j].href.indexOf('style.css') >= 0) {
                for (i = 0; i < document.styleSheets[j].cssRules.length; ++i) {
                    if (document.styleSheets[j].cssRules[i].constructor === CSSMediaRule) {
                        mediaText = document.styleSheets[j].cssRules[i].media.mediaText;
                        return window.matchMedia(mediaText).matches;
                    }
                }

                break;
            }
        }

        return false;
    };

    // Make sure we shift the content container so it's the fixed header is not over it
    $('.content').css('padding-top', $('header').outerHeight() || 0);

    // Only initialize skrollr on desktop
    //if (!window.isMobile()) { skrollr.init(); }

    // Make sure spaces in front of '?', '!', ':', ';' are non-breakable
    $('p').each((function() {
        var characters = ['?', '!', ':', ';'];
        return function() {
            var i;
            var $this = $(this),
                html = $this.html();

            for (i = 0; i < characters.length; ++i) {
                html = html.replace(
                    new RegExp('\\s+[' + characters[i] + ']', 'g'),
                    '&nbsp;' + characters[i]
                );
            }

            $this.html(html);
        };
    })());

    window.resetComponents = function() {
        var i;
        var components = ['definition', 'fold', 'more', 'videolink'];
        for (i = 0; i < components.length; ++i) {
            $('.' + components[i])[components[i]]();
        }

        $('.chapter__content p a').each(function() {
            $(this).attr('target', $(this).attr('href')[0] === '#' ? '_self' : '_blank');
        });

        setTimeout(function() {
            updateCoverTitles();
        }, 10);
        resizeCovers();

        window.paulloz.afterResetComponents();
    };

    // At last, initialize all of our components
    window.resetComponents();
});
