#!/usr/bin/env python

import os
import time
import json
import sqlite3
from contextlib import closing
from flask import Flask, g, render_template, request, url_for
from jinja2 import Markup
from werkzeug import secure_filename


DATABASE = os.path.join(os.path.dirname(os.path.realpath(__file__)), 'db.sql')
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.realpath(__file__)),
                             'static', 'upload')
ALLOWED_EXTENSIONS = set(['jpg', 'jpg', 'png', 'gif'])
DEBUG = True

PORT = int(os.environ.get('PORT') or 5000)

app = Flask(__name__)
app.config.from_object(__name__)


def init_db():
    with closing(connect_db()) as db:
        with app.open_resource('schema.sql', mode='r') as f:
            db.cursor().executescript(f.read())
        db.commit()


def connect_db():
    return sqlite3.connect(app.config['DATABASE'])


@app.before_request
def before_request():
    g.db = connect_db()


@app.teardown_request
def teardown_request(exception):
    db = getattr(g, 'db', None)
    if db is not None:
        db.close()


@app.route('/')
def longform():
    return render_template(
        'development.html',
        chapters=[
            dict(
                id=row[0],
                position=row[1],
                content=render_section(row)
            ) for row in g.db.execute(
                'SELECT id, position, content FROM chapters ORDER BY position ASC'
            )
        ]
    )


@app.route('/add', methods=['POST'])
def add():
    position = max([
        row[0] for row in g.db.execute(
            'SELECT position FROM chapters'
        )
    ] + [0]) + 1
    content = "<p>Lorem ipsum</p>"

    g.db.execute(
        'INSERT INTO chapters (content, position) VALUES(?, ?)',
        (content, position)
    )
    g.db.commit()
    return render_section([None, position, content])


@app.route('/save', methods=['POST'])
def save():
    g.db.executemany(
        'UPDATE chapters SET content = ? WHERE position = ?',
        [
            (
                Markup(content.replace('&amp;nbsp;', '&nbsp;')),
                position
            )
            for position, content in request.form.items()
        ]
    )
    g.db.commit()
    return ''


@app.route('/upload-image', methods=['POST'])
def upload_image():
    file = request.files['image']
    if file and allowed_file(file.filename):
        filename = secure_filename(
            '-{0}.'.format(str(int(time.time()))).join(file.filename.rsplit('.', 1))
        )
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
        return json.dumps(dict(
            url=url_for('static', filename='upload/{0}'.format(filename))
        ))


def render_section(row):
    return Markup(render_template(
        'section.html',
        position=row[1],
        content=Markup(
            render_template(
                'chapter.html',
                position=row[1],
                content=Markup(row[2])
            )
        )
    ))


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


if __name__ == '__main__':
    if not os.path.isfile(app.config['DATABASE']):
        init_db()
    app.run(host='0.0.0.0', port=PORT)
