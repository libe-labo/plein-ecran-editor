'use strict';

$.fn.definition = function() {
    var $container;

    this.off('mouseenter.definition');
    this.on('mouseenter.definition', function() {
        var $this = $(this);

        $container = $('.definition-container');
        if ($container.length <= 0) {
            $('body').append($('<div>').addClass('definition-container'));
            $container = $('.definition-container');
            $container.append($('<p>').addClass('definition-container__title'));
            $container.append($('<p>').addClass('definition-container__content'));
        }

        $container.find('.definition-container__title').text($this.text());
        $container.find('.definition-container__content').text($this.attr('rel'));
        $container.removeClass('hidden');

        var $window = $(window),
            margin = 30,
            top = $this.offset().top + $this.height() - parseInt($('.content').css('margin-top')),
            left = $this.offset().left + ($this.width() / 2) - ($container.width() / 2);

        if ($this.offset().top - $window.scrollTop() >= ($window.height() / 2)) {
            top -= $container.height() + margin;
        } else {
            top += margin / 3;
        }

        top = Math.max(
            0, Math.min(top, $window.scrollTop() + $window.height() - $container.height())
        );
        left = Math.max(0, Math.min(left, $window.width() - $container.width()));

        $container.css({
            top: top,
            left: left
        });
    });

    this.off('mouseleave.definition');
    this.on('mouseleave.definition', function() {
        $container.addClass('hidden');
    });
};
