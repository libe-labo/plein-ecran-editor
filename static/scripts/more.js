'use strict';

$.fn.more = function() {
    var $mobileContainer,
        $desktopContainer;

    this.on('click', (function() {
        var $this = $(this);

        $mobileContainer = $('.more-container--mobile');
        if ($mobileContainer.length <= 0) {
            $('body').append($('<div>').addClass('more-container more-container--mobile'));
            $mobileContainer = $('.more-container--mobile');
        }

        $desktopContainer = $('.more-container--desktop');

        $desktopContainer.empty().addClass('hidden');
        $mobileContainer.empty().addClass('hidden');

        $('<i>').addClass('fa fa-remove').on('click', function() {
            $mobileContainer.addClass('hidden');
            $('body').removeClass('noscroll');
        }).appendTo($('<div>').addClass('more-container--mobile__top').prependTo($mobileContainer));

        var content = $this.attr('rel');
        if (content.indexOf('#') === 0 && $(content).length > 0) {
            content = $(content).children().clone();
        } else {
            content = $('<p>').text(content);
        }

        $desktopContainer.append(content.clone());
        $mobileContainer.append(content.clone());

        window.setTimeout(function() {
            $desktopContainer.removeClass('hidden');
            $mobileContainer.removeClass('hidden');
            if ($desktopContainer.css('display') === 'block') {
                $('body').addClass('noscroll');
            }
        }, 10);
    }));
};
