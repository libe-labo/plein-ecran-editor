'use strict';

window.addEventListener('load', function() {
    var editor = ContentTools.EditorApp.get();

    var defineStyles = function() {
        ContentTools.StylePalette.add([
            new ContentTools.Style('Chapo', 'chapo', ['p']),
            new ContentTools.Style('Exergue', 'exergue', ['p', 'img', 'iframe']),
            new ContentTools.Style('Gauche', 'left', ['p', 'img', 'iframe']),
            new ContentTools.Style('Droite', 'right', ['p', 'img', 'iframe']),
            new ContentTools.Style('Citation', 'quote', ['p']),
            new ContentTools.Style('Question', 'question', ['p']),
            new ContentTools.Style('Appui', 'fold', ['p']),
            new ContentTools.Style('Légende', 'legend', ['p']),
            new ContentTools.Style('Grande photo', 'large', ['img']),
            new ContentTools.Style('Titre de couverture', 'cover-title', ['h1'])
        ]);
    };

    var defineTools = function() {
        var createToolWithPopup = function(attrName, className) {
            var Tool = _.clone(ContentTools.ToolShelf.fetch('bold'));

            Tool.getStuff = function(element, selection) {
                var c, tag;

                var sFrom = selection.get()[0],
                    sTo = selection.get()[1],
                    selectedContent = element.content.slice(sFrom, sTo);

                for (c in selectedContent.characters) {
                    c = selectedContent.characters[c];

                    if (!c.hasTags(Tool.tagName)) {
                        continue;
                    }

                    for (tag in c.tags()) {
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
                    selectTag = new HTMLString.Tag('span', { class: 'ct--pseudo-select' }),
                    sFrom = selection.get()[0], sTo = selection.get()[1],
                    dialog,
                    modal = new ContentTools.ModalUI({ transparent: true, allowScrolling: true });

                var domElement, measureSpan, rect;

                element.storeState();

                element.content = element.content.format(sFrom, sTo, selectTag);
                element.updateInnerHTML();

                modal.addEventListener('click', function() {
                    this.unmount();
                    dialog.hide();

                    element.content = element.content.unformat(sFrom, sTo, selectTag);
                    element.updateInnerHTML();

                    element.restoreState();

                    callback(false);
                });

                domElement = element.domElement();
                measureSpan = domElement.getElementsByClassName('ct--pseudo-select');
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
                dialog.addEventListener('save', function(ev) {
                    var stuff = ev.detail().href,
                        htmlStringAttrs;

                    element.content = element.content.unformat(sFrom, sTo, Tool.tagName);

                    if (stuff != null) {
                        htmlStringAttrs = { class: className };
                        htmlStringAttrs[attrName] = stuff.replace(/"/g, '');
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

    var defineCoverTools = function() {
        $('.chapter__cover').each(function() {
            var chapterCover = $(this);
            var btn = $('<div>', { class: 'ct-ignition__button ct-ignition__button--cover' });

            btn.on('click', function() {
                var modal = new ContentTools.ModalUI({ transparent: true, allowScrolling: true }),
                    dialog = new ContentTools.ImageDialog();

                modal.addEventListener('click', function() {
                    modal.hide();
                    dialog.hide();
                });

                dialog.addEventListener('cancel', function() {
                    modal.hide();
                    dialog.hide();
                });

                dialog.addEventListener('save', function(ev) {
                    chapterCover.css('background-image', 'url(' + ev.detail().imageURL + ')');

                    modal.hide();
                    dialog.hide();

                    new ContentTools.FlashUI('ok');
                });

                editor.attach(modal);
                editor.attach(dialog);
                modal.show();
                dialog.show();
            });

            btn.appendTo($('<div>', { class: 'ct-widget ct-covers' }).appendTo(chapterCover));
        });
    };

    var onStopEdit = function() {
        $('.chapter__content > *').each(function() {
            if ($(this).hasClass('menu')) { return; }

            $(this).html($(this).html().replace('&amp;nbsp;', '&nbsp;'));
        });

        $('.ct-covers').remove();

        window.resetComponents();
    };

    var startEditor = function() {
        editor.init('.chapter__content', 'data-name');

        $('.ct-ignition__button--cancel').click(function() {
        });

        $('.ct-ignition__button--edit')[0].addEventListener('click', function() {
            $('.fold.folded').removeClass('folded');

            $('.chapter__content > *').each(function() {
                if ($(this).hasClass('menu')) { return; }

                $(this).html($(this).html().replace('&nbsp;', '&amp;nbsp;'));
            });
        });

        $('.ct-widget').append(
            $('<div>', {
                class: 'ct-ignition__button ct-ignition__button--add-chapter'
            }).click(function() {
                var confirmationText = 'On ajoute vraiment un chapitre ?\n' +
                                       '(Toutes les modifications non sauvegardées seront perdues)';
                if (window.confirm(confirmationText)) {
                    editor.busy(true);
                    $.post('/add', function(data, status) {
                        editor.busy(false);
                        if (status === 'success') {
                            new ContentTools.FlashUI('ok');
                            $('.content').append(data);
                            $('ul').append(
                                $('<li>').append(
                                    $('<a>', {
                                        href: '#' + $('section:last-of-type').attr('id')
                                    }).text('Chapitre ' + String($('section').length))
                                )
                            );
                            editor.destroy();
                            startEditor();
                        } else {
                            new ContentTools.FlashUI('no');
                        }
                    });
                }
            })
        );

        onStopEdit();
    };

    ContentTools.DEFAULT_TOOLS = [
        ['bold', 'italic', 'link'],
        ['heading', 'subheading', 'paragraph'],
        ['superscript', 'definition', 'videolink'],
        ['line-break', 'image', 'video'],
        ['undo', 'redo', 'remove']
    ];

    editor.addEventListener('saved', function(ev) {
        var regions = ev.detail().regions;
        var data = { regions: {}, covers: {} };
        var k;

        editor.busy(true);

        for (k in regions) {
            if (regions.hasOwnProperty(k) && k.indexOf('chapitre-') === 0) {
                data.regions[k.replace('chapitre-', '')] = regions[k];
            }
        }

        $('.chapter__cover').each(function() {
            var url = $(this).css('background-image');
            if (url != null && url !== 'none') {
                url = url.replace(/^url\(/, '').replace(/["']/g, '')
                         .replace(/\)$/, '').replace(/.*\/static/, '/static');
                data.covers[$(this).parent().children('.chapter__content').attr('data-name').replace('chapitre-', '')] = url;
            }
        });

        $.ajax({
            type: 'POST',

            contentType: 'application/json',

            url: '/save',
            data: JSON.stringify(data),

            success: function(_, status) {
                onStopEdit();

                editor.busy(false);
                if (status === 'success') {
                    new ContentTools.FlashUI('ok');
                } else {
                    new ContentTools.FlashUI('no');
                }
            }
        });
    });

    ContentTools.IMAGE_UPLOADER = function(dialog) {
        var image, xhr, xhrComplete, xhrProgress;

        dialog.addEventListener('imageuploader.cancelupload', function() {
            if (xhr != null) {
                xhr.upload.removeEventListener('progress', xhrProgress);
                xhr.removeEventListener('readystatechange', xhrComplete);
                xhr.abort();
            }

            dialog.state('empty');
        });

        dialog.addEventListener('imageuploader.clear', function() {
            dialog.clear();
            image = null;
        });

        dialog.addEventListener('imageuploader.fileready', function(ev) {
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
                            url: response.url,
                            size: [this.width, this.height]
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
            formData.append('image', ev.detail().file);

            xhr = new XMLHttpRequest();
            xhr.upload.addEventListener('progress', xhrProgress);
            xhr.addEventListener('readystatechange', xhrComplete);
            xhr.open('POST', '/upload-image', true);
            xhr.send(formData);
        });

        dialog.addEventListener('imageuploader.save', function() {
            if (image != null && image.url != null) {
                dialog.save(image.url, image.size);
            } else {
                new ContentTools.FlashUI('no');
            }
        });
    };

    editor.addEventListener('start', function() {
        defineCoverTools();
        [].slice.call(document.querySelectorAll('.chapter__content .cover-title')).forEach(function(title) {
            title.style.display = 'block';
        });
    });

    editor.addEventListener('stop', onStopEdit);

    if ($('.chapter__content').length > 0) {
        defineStyles();
        defineTools();
        startEditor();
    } else {
        $.post('/add', { }, function() {
            window.location.reload();
        });
    }
});
