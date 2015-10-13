'use strict';

$.fn.fold = function() {
    $(this).each(function() {
        var $this = $(this);

        if ($this.find('.fa').length <= 0) {
            $this.children('span').first().append($('<i>', { class : 'fa fa-plus' }));
        }

        if ($this.find('.fa').length > 0) {
            $this.addClass('folded');

            $this.find('.fa')
                 .off('click.fold')
                 .on('click.fold', function() {
                     var $fa = $(this);
                     if ($fa.hasClass('fa-plus')) {
                         $fa.removeClass('fa-plus').addClass('fa-minus');
                         $this.removeClass('folded');
                     } else {
                         $fa.removeClass('fa-minus').addClass('fa-plus');
                         $this.addClass('folded');
                     }
                 });
        }
    });
};
