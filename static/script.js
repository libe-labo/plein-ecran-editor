/* global CSSMediaRule: false, skrollr: false */
'use strict';

$(function() {
    // Check the first @media query present in our stylesheets to know if we're on a mobile or not
    window.isMobile = function() {
        for (var j = 0; j < document.styleSheets.length; ++j) {
            if (document.styleSheets[j] == null ||
                document.styleSheets[j].href == null) { continue; }
            if (document.styleSheets[j].href.indexOf('style.css') >= 0) {
                for (var i = 0; i < document.styleSheets[j].cssRules.length; ++i) {
                    if (document.styleSheets[j].cssRules[i].constructor === CSSMediaRule) {
                        var mediaText = document.styleSheets[j].cssRules[i].media.mediaText;
                        return window.matchMedia(mediaText).matches;
                    }
                }
                break;
            }
        }
        return false;
    };

    // I'm hiding all of this in a function 'cause this kind of code is a mess and is ugly
    function handleEverythingScrollRelated() {
        function getTopPos(e) {
            if (typeof(e) === typeof('')) {
                e = $('#' + e.replace(/^#/, ''));
            }
            var pos = e.find('.chapter__content').position() || { top : 0 };
            return parseInt(pos.top - $('header').outerHeight());
        }

        function updateChapterLinks() {
            $('header a[href="' + window.location.hash + '"]').parent('li').addClass('active')
                .siblings().removeClass('active');
        }

        $('.menu a').on('click', function(event) {
            event.preventDefault();
            event.stopPropagation();
            window.history.pushState(null, null, $(event.currentTarget).attr('href'));
            if ($(this).attr('href') === window.location.hash) {
                $('body').animate({
                    scrollTop : getTopPos(window.location.hash)
                });
                updateChapterLinks();
            }
        });

        $(window).on('scroll', function() {
            var scrollTop = $(window).scrollTop(),
                currentHash = window.location.hash.replace(/^#/, ''),
                $chapters = $('section.chapter');

            for (var i = 0; i < $chapters.length; ++i) {
                if (scrollTop < getTopPos($($chapters.get(i)))) {
                    break;
                }
            }
            var newHash = $($chapters.get(Math.max(0, i - 1))).attr('id');
            if (newHash !== currentHash) {
                window.history.pushState(null, null, '#' + newHash);
                updateChapterLinks();
            }
        }).on('hashchange', function(event) {
            event.preventDefault();
            event.stopPropagation();
            $(window).scrollTop(getTopPos(window.location.hash));
            updateChapterLinks();
        });

        if (window.location.hash != null && window.location.hash.length > 0) {
            window.setTimeout(function() {
                $(window).scrollTop(0);
                $(window).scrollTop(getTopPos(window.location.hash));
                updateChapterLinks();
            }, 100);
        }
    }

    // Make sure we shift the content container so it's the fixed header is not over it
    $('.content').css('padding-top', $('header').outerHeight() || 0);

    // Only initialize skrollr on desktop
    //if (!window.isMobile()) { skrollr.init(); }

    // Make sure spaces in front of '?', '!', ':', ';' are non-breakable
    $('p').each((function() {
        var characters = ['?', '!', ':', ';'];
        return function() {
            var $this = $(this),
                html = $this.html();

            for (var i = 0; i < characters.length; ++i) {
                html = html.replace(
                    new RegExp('\\s+[' + characters[i] + ']', 'g'),
                    '&nbsp;' + characters[i]
                );
            }

            $this.html(html);
        };
    })());

    var resizeCovers = function() {
        $('.chapter__cover').css('height', $(window).innerHeight());
    };

    $(window).on('resize', _.debounce(resizeCovers, 200));

    window.resetComponents = function() {
        var components = ['definition', 'fold', 'more', 'videolink'];
        for (var i = 0; i < components.length; ++i) {
            $('.' + components[i])[components[i]]();
        }

        $('.chapter__content p a').attr('target', '_blank');

        resizeCovers();
    };

    // At last, initialize all of our components
    window.resetComponents();

    handleEverythingScrollRelated();
});
