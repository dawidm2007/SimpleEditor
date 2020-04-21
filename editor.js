document.execCommand('defaultParagraphSeparator', false, 'p');

function Editor(settings) {
    let editor = settings.editor
    let placeholderTag = null
    let cursor = { el: null, offset: 0 }

    {
        editor.setAttribute('contenteditable', 'true');
        editor.innerHTML = '';
        placeholderTag = document.createElement('span');
        placeholderTag.textContent = settings.placeholder;
        editor.appendChild(placeholderTag);
    }

    {   
        /* SETUP TOOLBAR */

        let fontSize = document.getElementById('font-size')
        fontSize.value = 16

        fontSize.addEventListener('input', (e) => {
            editor.focus()
            let range = new Range()
            range.setStart(cursor.el, cursor.offset);

            window.getSelection().removeAllRanges()
            window.getSelection().addRange(range)

            if(cursor.el.nodeName == '#text'){
                cursor.el.parentElement.style.fontSize = `${e.target.value}px`
            }else {
                cursor.el.style.fontSize = `${e.target.value}px`;
            }
        })

        let fonts = [
          'Calibri',
          'Bebas Neue',
          'DejaVu Serif',
          'Impact',
          'Segoe Script',
          'Comic Sans MS',
          'System',
        ];

        let currentFont = 'Calibri';
        let fontList = document.getElementById('font-list');

        for (let font of fonts) {
          let fontItem = document.createElement('div');
          fontItem.setAttribute('class', 'font-item');
          let fontName = document.createElement('h1');
          fontName.style.fontFamily = font;
          fontName.textContent = font;
          fontItem.appendChild(fontName);

          fontItem.addEventListener('mouseover', () => {
                if (cursor.el.nodeName == '#text') {
                    cursor.el.parentElement.style.fontFamily = font;
                } else {
                    cursor.el.style.fontFamily = font;
                }
          });

          fontItem.addEventListener('mousedown', (event) => {
            event.preventDefault();
            currentFont = font;
            let currFont = document.getElementById('font-current');
            currFont.children[0].style.fontFamily = font;
            currFont.children[0].textContent = font;
          });

          fontList.appendChild(fontItem);
        }

        fontList.addEventListener('mouseleave', () => {
            if (cursor.el.nodeName == '#text') {
                cursor.el.parentElement.style.fontFamily = currentFont;
            } else {
                cursor.el.style.fontFamily = currentFont;
            }
        });


        for (let tag of ['p', 'h1', 'h2', 'h3', 'h4']) {
            let div = document.createElement('div');
            div.innerHTML = tag;
            
            div.addEventListener('mousedown', (e) => {
                e.preventDefault();
                let newEl = document.createElement(tag);
                let cursor = window.getSelection().getRangeAt(0)
                let cursorOffset = cursor.startOffset;

                if(cursor.startContainer.nodeName == '#text'){
                    newEl.innerHTML = cursor.startContainer.parentNode.innerHTML;
                    newEl.style.cssText = cursor.startContainer.parentElement.style.cssText
                    console.log(newEl.style.cssText);
                    editor.replaceChild(newEl, cursor.startContainer.parentElement);
                } else {
                    newEl.innerHTML = cursor.startContainer.innerHTML;
                    newEl.style.cssText = cursor.startContainer.style.cssText
                    editor.replaceChild(newEl, cursor.startContainer);
                }

                let range = new Range();
                newEl.childNodes.length > 0 ?
                    range.setStart(newEl.childNodes[0], cursorOffset) :
                    range.setStart(newEl, cursorOffset)

                window.getSelection().removeAllRanges();
                window.getSelection().addRange(range);
            });

            document.getElementById('tags').appendChild(div);
        }
    }


    let bold = document.getElementById("bold")
    bold.addEventListener('click', (e) => {
        let range = window.getSelection().getRangeAt(0)
        /* 

            <div id="editor">
                <p>start</p>  -> startContainer
                <p><span style="font-weight: bold;">bbb</span></p>  -> startContainer.nextSibiling
                <p>ccc</p>  -> startContainer.nextSibiling.nextSibiling
                <p>end</p>  -> endContainer
            </div>
        */

        let currentEl = range.startContainer
        

        while (currentEl !== range.endContainer.parentElement) {
            if (currentEl.nodeName == '#text') {
                currentEl = currentEl.parentElement.nextElementSibling;
            } else {
                currentEl = currentEl.nextElementSibling;
            }

            currentEl.innerHTML = `<span style="font-weight: bold;">${currentEl.innerHTML}</span>`;
            console.log(range.endContainer);
        }

    })

    /* END SETUP TOOLBAR */ 
    editor.addEventListener('click', (e) => {
        cursor.el = window.getSelection().getRangeAt(0).startContainer;
        cursor.offset = window.getSelection().getRangeAt(0).startOffset;
    })

    editor.addEventListener('keydown', (e) => {
        switch (e.key) {
            case 'Backspace':                
                if(editor.children.length == 1 && editor.children[0].textContent.length == 0) {
                        e.preventDefault()
                }
            default:
                break;
        }
    })

    editor.addEventListener('keyup', (e) => {
        cursor.el = window.getSelection().getRangeAt(0).startContainer;
        cursor.offset = window.getSelection().getRangeAt(0).startOffset;
    })

    editor.addEventListener('focus', (e) => {
        if (editor.children[0] == placeholderTag) {
            e.preventDefault();
            editor.replaceChild(document.createElement('p'), placeholderTag);

            let range = new Range();
            range.setStart(editor.childNodes[0], 0);
            window.getSelection().removeAllRanges();
            window.getSelection().addRange(range);
        }
    })

    editor.addEventListener('blur', (e) => {
      if (
        editor.children.length == 1 &&
        editor.children[0].textContent.length == 0
      ) {
        editor.replaceChild(placeholderTag, editor.children[0]);
      }
    });

    return this
}

var richTextEditor = new Editor({
  editor: document.getElementById('editor'),
  placeholder: 'Rozpocznij pisanie artykułu',
});