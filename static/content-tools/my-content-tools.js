'use strict';

window.addEventListener('load', function() {
    var editor = ContentTools.EditorApp.get();

    var defineStyles = function() {
        ContentTools.StylePalette.add([
            new ContentTools.Style('Chapo', 'chapo', ['p']),
            new ContentTools.Style('Exergue', 'exergue', ['p', 'img']),
            new ContentTools.Style('Gauche', 'left', ['p', 'img']),
            new ContentTools.Style('Droite', 'right', ['p', 'img']),
            new ContentTools.Style('Citation', 'quote', ['p']),
            new ContentTools.Style('Question', 'question', ['p']),
            new ContentTools.Style('Appui', 'fold', ['p'])
        ]);
    };

    var defineTools = function() {
        var createToolWithPopup = function(attrName, className) {
            var Tool = _.clone(ContentTools.ToolShelf.fetch('bold'));

            Tool.getStuff = function(element, selection) {
                var sFrom = selection.get()[0],
                    sTo = selection.get()[1],
                    selectedContent = element.content.slice(sFrom, sTo);

                for (var c in selectedContent.characters) {
                    c = selectedContent.characters[c];

                    if (!c.hasTags(Tool.tagName)) {
                        continue;
                    }

                    for (var tag in c.tags()) {
                        tag = c.tags()[tag];
                        if (tag.name() === Tool.tagName) {
                            return tag.attr(attrName);
                        }
                    }
                }

                return '';
            };

            Tool.apply = function(element, selection, callback) {
                var app = ContentTools.EditorApp.get(),
                    selectTag = new HTMLString.Tag('span', { class : 'ct--pseudo-select' }),
                    sFrom = selection.get()[0], sTo = selection.get()[1],
                    dialog,
                    modal = new ContentTools.ModalUI({transparent:true,allowScrolling:true});

                element.storeState();

                element.content = element.content.format(sFrom, sTo, selectTag);
                element.updateInnerHTML();

                modal.bind('click', function() {
                    this.unmount();
                    dialog.hide();

                    element.content = element.content.unformat(sFrom, sTo, selectTag);
                    element.updateInnerHTML();

                    element.restoreState();

                    callback(false);
                });

                var domElement = element.domElement(),
                    measureSpan = domElement.getElementsByClassName('ct--pseudo-select'),
                    rect = measureSpan[0].getBoundingClientRect();

                dialog = new ContentTools.LinkDialog(this.getStuff(element, selection));
                (function() {
                    var mount = dialog.mount;
                    dialog.mount = function() {
                        var ret = mount.bind(this)();
                        this._domInput.setAttribute('placeholder', Tool.label);
                        return ret;
                    };
                })();
                dialog.position([
                    rect.left + (rect.width / 2) + window.scrollX,
                    rect.top + (rect.height / 2) + window.scrollY
                ]);
                dialog.bind('save', function(stuff) {
                    element.content = element.content.unformat(sFrom, sTo, Tool.tagName);

                    if (stuff != null) {
                        var htmlStringAttrs = { class : className };
                        htmlStringAttrs[attrName] = stuff;
                        element.content = element.content.format(
                            sFrom,
                            sTo,
                            new HTMLString.Tag(Tool.tagName, htmlStringAttrs)
                        );
                    }

                    element.updateInnerHTML();
                    element.taint();

                    modal.unmount();
                    dialog.hide();

                    element.content = element.content.unformat(sFrom, sTo, selectTag);
                    element.updateInnerHTML();

                    element.restoreState();

                    callback(true);
                });

                app.attach(modal);
                app.attach(dialog);
                modal.show();
                dialog.show();
            };

            return Tool;
        };

        // Superscript
        (function() {
            var Tool = _.clone(ContentTools.ToolShelf.fetch('bold'));
            Tool.label = 'Superscript';
            Tool.icon = 'superscript';
            Tool.tagName = 'sup';
            ContentTools.ToolShelf.stow(Tool, 'superscript');
        })();

        // Definition
        (function() {
            var Tool = createToolWithPopup('rel', 'definition');

            Tool.label = 'Définition';
            Tool.icon = 'definition';
            Tool.tagName = 'span';

            ContentTools.ToolShelf.stow(Tool, 'definition');
        })();

        // Video
        (function() {
            var Tool = createToolWithPopup('href', 'videolink');

            Tool.label = 'Lien vidéo';
            Tool.icon = 'youtube2';
            Tool.tagName = 'a';

            ContentTools.ToolShelf.stow(Tool, 'videolink');
        })();
    };

    var onStopEdit = function() {
        $('.chapter__content > *').each(function() {
            if ($(this).hasClass('menu')) { return; }
            $(this).html($(this).html().replace('&amp;nbsp;', '&nbsp;'));
        });

        window.resetComponents();
    };

    var startEditor = function() {
        editor.init('.chapter__content', 'data-name');

        $('.ct-ignition__button--cancel').click(function() {
            onStopEdit();
        });

        $('.ct-ignition__button--edit')[0].addEventListener('click', function() {
            $('.chapter__content > *').each(function() {
                if ($(this).hasClass('menu')) { return; }
                $(this).html($(this).html().replace('&nbsp;', '&amp;nbsp;'));
            });
        });

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
            })
        );

        onStopEdit();
    };

    ContentTools.DEFAULT_TOOLS = [
        ['bold', 'italic', 'link'],
        ['heading', 'subheading', 'paragraph'],
        ['superscript', 'definition', 'videolink'],
        ['line-break', 'image'],
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
            onStopEdit();

            editor.busy(false);
            if (status === 'success') {
                new ContentTools.FlashUI('ok');
            } else {
                new ContentTools.FlashUI('no');
            }
        });
    });

    ContentTools.IMAGE_UPLOADER = function(dialog) {
        var image, xhr, xhrComplete, xhrProgress;

        dialog.bind('imageUploader.cancelUpload', function() {
            if (xhr != null) {
                xhr.upload.removeEventListener('progress', xhrProgress);
                xhr.removeEventListener('readystatechange', xhrComplete);
                xhr.abort();
            }
            dialog.state('empty');
        });

        dialog.bind('imageUploader.clear', function() {
            dialog.clear();
            image = null;
        });

        dialog.bind('imageUploader.fileReady', function(file) {
            var formData;

            xhrProgress = function(ev) {
                dialog.progress((ev.loaded / ev.total) * 100);
            };

            xhrComplete = function(ev) {
                var response;

                if (ev.target.readyState !== 4) {
                    return;
                }

                xhr = xhrProgress = xhrComplete = null;

                if (parseInt(ev.target.status) === 200) {
                    response = JSON.parse(ev.target.responseText);

                    image = new Image();
                    image.onload = function() {
                        image = {
                            url : response.url,
                            size : [this.width, this.height]
                        };

                        dialog.populate(image.url, image.size);
                    };
                    image.src = response.url;
                } else {
                    new ContentTools.FlashUI('no');
                }
            };

            dialog.state('uploading');
            dialog.progress(0);

            formData = new FormData();
            formData.append('image', file);

            xhr = new XMLHttpRequest();
            xhr.upload.addEventListener('progress', xhrProgress);
            xhr.addEventListener('readystatechange', xhrComplete);
            xhr.open('POST', '/upload-image', true);
            xhr.send(formData);
        });

        dialog.bind('imageUploader.save', function() {
            if (image != null && image.url != null) {
                dialog.save(image.url, image.size);
            } else {
                new ContentTools.FlashUI('no');
            }
        });
    };

    defineStyles();
    defineTools();
    if ($('.chapter__content').length > 0) {
        startEditor();
    } else {
        $.post('/add', { }, function() {
            window.location.reload();
        });
    }
});
