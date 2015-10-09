'use strict';

$.fn.fold = function() {
    $(this).each(function() {
        var $this = $(this);

        if ($this.find('.fold__inner').length > 0) {
            var toggle = function() {
                var $button = $(this);

                if ($button.hasClass('fa-plus')) {
                    $button.removeClass('fa-plus').addClass('fa-minus');
                    $this.find('.fold__inner').removeClass('folded');
                } else {
                    $button.removeClass('fa-minus').addClass('fa-plus');
                    $this.find('.fold__inner').addClass('folded');
                }
            };
            if ($this.find('p').first().children('i.fa-plus').length > 0) {
                $this.find('p').first().children('i.fa-plus').off('click.fold')
                                                             .on('click.fold', toggle);
            } else {
                $('<i>').addClass('fa fa-plus')
                        .on('click.fold', toggle)
                        .prependTo($this.children('p').first());
            }


            $this.find('.fold__inner').addClass('folded');
        }

        if ($this.children('.fold__wrapper').length < 1) {
            $this.children().appendTo($('<div>').addClass('fold__wrapper').appendTo($this));
        }
    });
};
