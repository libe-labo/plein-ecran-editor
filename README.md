Un semblant d'éditeur pour bootstraper des [Pleins Écrans](http://www.liberation.fr/apps/2015/10/jmjarre/).

## Installation

Cet éditeur a besoin de [**Python3**](https://www.python.org/downloads/) ainsi que de [**Pip3**](https://pip.pypa.io/en/stable/installing/).  
Après, il suffit de lancer :
```bash
$> make install
```
Et si il n'y a pas d'erreur d'affichée sur l'écran c'est qu'on est bons :shipit:

```bash
$> [PORT=5555] make run
```

## Mise en ligne

1. Compléter les meta-tags dans `templates/base.html`  
2. Compléter les tracking-tags dans `template/production.html`  
3. Compiler `static/style/*.less` dans `statis/style/style.css`
  * `$> lessc static/style/style.less > static/style/style.css`
4. Retourner sauvegarder dans l'éditeur (ça va mettre à jour le fichier `index.html`)
5. Uploader `index.html` `static/scripts/` `static/style/style.css` `static/upload/`
6. Enjoy 🍦

## To do

* Meilleure gestion des insécables
* Édition simplifiée des appuis
* Gestion des accès concurrents

## License

> The MIT License (MIT)
>
> Copyright (c) Libé Six Plus 2015 - 2016
>
> Permission is hereby granted, free of charge, to any person obtaining a copy
> of this software and associated documentation files (the "Software"), to deal
> in the Software without restriction, including without limitation the rights
> to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
> copies of the Software, and to permit persons to whom the Software is
> furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in
> all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
> IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
> FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
> AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
> LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
> OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
> THE SOFTWARE.
