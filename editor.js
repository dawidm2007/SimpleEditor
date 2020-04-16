function Editor(settings) {
    let editor = settings.editor
    let placeholderTag = null

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
        fontSize.addEventListener('input', (e) => {
            console.log(window.getSelection().getRangeAt(0))
        })

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
                    editor.replaceChild(newEl, cursor.startContainer.parentNode);
                } else {
                    newEl.innerHTML = cursor.startContainer.innerHTML;
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

    editor.addEventListener('keydown', (e) => {
        switch (e.key) {
            case 'Backspace':                
                if(editor.children.length == 1 && editor.children[0].textContent.length == 0) {
                        e.preventDefault()
                }
                break;
            default:
                break;
        }
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


function Toolbar() {

}