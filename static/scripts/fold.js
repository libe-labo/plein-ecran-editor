'use strict';

$.fn.fold = function() {
    $(this).each(function() {
        var $this = $(this);

        if ($this.find('.fa').length <= 0) {
            $this.children('span').first().append($('<i>', { class: 'fa fa-angle-down' }));
        }

        if ($this.find('.fa').length > 0) {
            $this.addClass('folded');

            $this.find('.fa')
                 .off('click.fold')
                 .on('click.fold', function() {
                     var $fa = $(this);
                     if ($fa.hasClass('fa-angle-down')) {
                         $fa.removeClass('fa-angle-down').addClass('fa-angle-up');
                         $this.removeClass('folded');
                     } else {
                         $fa.removeClass('fa-angle-up').addClass('fa-angle-down');
                         $this.addClass('folded');
                     }
                 });
        }
    });
};
