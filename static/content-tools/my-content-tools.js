'use strict';

window.addEventListener('load', function() {
    var editor = ContentTools.EditorApp.get();

    var defineStyles = function() {
        ContentTools.StylePalette.add([
            new ContentTools.Style('Chapo', 'chapo', ['p'])
        ]);
    };

    var startEditor = function() {
        editor.init('.chapter__left', 'data-name');

        $('.ct-widget').append(
            $('<div>', {
                class : 'ct-ignition__button ct-ignition__button--add-chapter'
            }).click(function() {
                editor.busy(true);
                $.post('/add', function(data, status) {
                    editor.busy(false);
                    if (status === 'success') {
                        new ContentTools.FlashUI('ok');
                        $('.content').append(data);
                        $('ul').append(
                            $('<li>').append(
                                $('<a>', {
                                    href : '#' + $('section:last-of-type').attr('id')
                                }).text('Chapitre ' + String($('section').length))
                            )
                        );
                        editor.destroy();
                        startEditor();
                    } else {
                        new ContentTools.FlashUI('no');
                    }
                });
            }).append($('<i>', { class : 'fa fa-plus' }))
        );
    };

    ContentTools.DEFAULT_TOOLS = [
        ['bold', 'italic', 'link'],
        ['paragraph', 'line-break'],
        ['undo', 'redo', 'remove']
    ];

    editor.bind('save', function(regions) {
        editor.busy(true);

        var data = { };
        for (var k in regions) {
            if (regions.hasOwnProperty(k) && k.indexOf('chapitre-') === 0) {
                data[k.replace('chapitre-', '')] = regions[k];
            }
        }

        $.post('/save', data, function(_, status) {
            editor .busy(false);
            if (status === 'success') {
                new ContentTools.FlashUI('ok');
            } else {
                new ContentTools.FlashUI('no');
            }
        });
    });

    startEditor();
    defineStyles();
});
