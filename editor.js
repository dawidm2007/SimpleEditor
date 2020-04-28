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
        let startEl = getElementFromRange(range.startContainer)
        let endEl = getElementFromRange(range.endContainer)

        let rangeClone = {
            startOffset: range.startOffset,
            endOffset: range.endOffset,
            startContainer: startEl,
            endContainer: endEl,
        };

        if(startEl === endEl){
            let str = startEl.textContent
            let textStart = str.substring(0, range.startOffset)
            let textEnd = str.substring(range.endOffset,startEl.textContent.length - 1)
            let textToBold = str.substring(range.startOffset,range.endOffset)
            startEl.innerHTML = 
                `${textStart}<span style="font-weight: bold; color: black;">${textToBold}</span>${textEnd}`;
            
            rangeClone.startContainer = startEl.children[0].childNodes[0];
            rangeClone.endContainer = startEl.children[0].childNodes[0];
            rangeClone.endOffset = rangeClone.endOffset - rangeClone.startOffset
            
        } else {
            let offset = range.startOffset;
            while(startEl != endEl) {
                let str = startEl.textContent
                let textStart = str.substring(0, offset);
                let textToBold = str.substring(offset, str.length - 1);
                startEl.innerHTML = 
                    `${textStart}<span style="font-weight: bold; color: black;">${textToBold}</span>`;
                if(offset != 0){
                    rangeClone.startContainer = startEl.children[0].childNodes[0];
                }
                offset = 0
                startEl = startEl.nextSibling
            }
            let str = endEl.textContent;
            let textStart = str.substring(0, range.endOffset);
            let textEnd = str.substring(range.endOffset, str.length - 1);
            startEl.innerHTML = `<span style="font-weight: bold; color: black;">${textStart}</span>${textEnd}`;
            rangeClone.endContainer = startEl.children[0].childNodes[0];
        }

        let newRange = new Range()
        newRange.setStart(rangeClone.startContainer, 0)
        newRange.setEnd(rangeClone.endContainer, rangeClone.endOffset);
        
        let selection = window.getSelection()
        selection.removeAllRanges()
        selection.addRange(newRange)

    })

    let italic = document.getElementById("italic")
    italic.addEventListener('click', (e) => {
        let range = window.getSelection().getRangeAt(0)
        let startEl = getElementFromRange(range.startContainer)
        let endEl = getElementFromRange(range.endContainer)

        let rangeClone = {
            startOffset: range.startOffset,
            endOffset: range.endOffset,
            startContainer: startEl,
            endContainer: endEl,
        };

        if(startEl === endEl){
            let str = startEl.textContent
            let textStart = str.substring(0, range.startOffset)
            let textEnd = str.substring(range.endOffset,startEl.textContent.length - 1)
            let textToItalic = str.substring(range.startOffset,range.endOffset)
            startEl.innerHTML = 
                `${textStart}<span style="font-style: italic; color: black;">${textToItalic}</span>${textEnd}`;
            
            rangeClone.startContainer = startEl.children[0].childNodes[0];
            rangeClone.endContainer = startEl.children[0].childNodes[0];
            rangeClone.endOffset = rangeClone.endOffset - rangeClone.startOffset
            
        } else {
            let offset = range.startOffset;
            while(startEl != endEl) {
                let str = startEl.textContent
                let textStart = str.substring(0, offset);
                let textToItalic = str.substring(offset, str.length - 1);
                startEl.innerHTML = 
                    `${textStart}<span style="font-style: italic; color: black;">${textToItalic}</span>`;
                if(offset != 0){
                    rangeClone.startContainer = startEl.children[0].childNodes[0];
                }
                offset = 0
                startEl = startEl.nextSibling
            }
            let str = endEl.textContent;
            let textStart = str.substring(0, range.endOffset);
            let textEnd = str.substring(range.endOffset, str.length - 1);
            startEl.innerHTML = `<span style="font-style: italic; color: black;">${textStart}</span>${textEnd}`;
            rangeClone.endContainer = startEl.children[0].childNodes[0];
        }

        let newRange = new Range()
        newRange.setStart(rangeClone.startContainer, 0)
        newRange.setEnd(rangeClone.endContainer, rangeClone.endOffset);
        
        let selection = window.getSelection()
        selection.removeAllRanges()
        selection.addRange(newRange)

    })

    function getElementFromRange(node) {
        let currentEl = isElement(node)
          ? node
          : node.parentElement;
        currentEl = isModifier(currentEl) ? currentEl.parentElement : currentEl;
        return currentEl
    }

    function isElement(node) {
        if(node.nodeName === '#text') return false
        else return true
    }

    function isModifier(node){
        if(node.nodeName === 'SPAN') return true
        else return false
    }

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