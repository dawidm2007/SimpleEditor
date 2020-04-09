function Editor(settings) {
    let el = settings.el;
    let placeholderTag = null;
    let activeNode = null;

    (function(){
        if(el.getAttribute("contenteditable") == null) {
            el.setAttribute("contenteditable", "true")
        }

        el.innerHTML =""
        placeholderTag = document.createElement('span') 
        placeholderTag.textContent = settings.placeholder
        el.appendChild(placeholderTag)
    })();

    el.addEventListener('keydown', (e) =>{
        switch(e.key) {
            case 'Enter':
                e.preventDefault()
                let newEl = addTag()
                let cursor = getCursor()
                let lContent = null

                if(cursor.startOffset < activeNode.textContent.length ) {
                    lContent = activeNode.textContent.substring(
                        cursor.startOffset,
                        activeNode.textContent.length
                    );
                    activeNode.textContent = activeNode.textContent.substring(0, cursor.startOffset)
                } else{
                    lContent = '&nbsp'
                }

                cursor.setStartAfter(activeNode);
                cursor.surroundContents(newEl)

                newEl.innerHTML = lContent;
                createCursor(newEl)
                activeNode = newEl;
            break;
            default:
            break;
        }
    })

    el.addEventListener('keyup', (e) => {
        switch(e.data) {
            case 'ArrowUp':
            case 'ArrowDown':
            case 'ArrowLeft':
            case 'ArrowRigth':
                let newCursor = getCursor()
                activeNode = newCursor.startContainer.parentElement;
                break;
            default:
                break;
        }
    })

    el.addEventListener('focus', (e) => {
        if(el.children[0] == placeholderTag) {
            e.preventDefault()
            el.innerHTML = ""
            let tagP = addTag()
            tagP.innerHTML = "&nbsp"
            activeNode = tagP
            el.appendChild(tagP)
            createCursor(tagP)
        }
    })

    el.addEventListener('blur', (e) => {
        if(
            el.children[0].textContent.length == 0 &&
            el.children.length == 1 ||  // "||" oznacza lub
            el.children.length == 0
        ){
            el.innerHTML = ""
            el.appendChild(placeholderTag)
        }
    })

    el.addEventListener('click', (e) => {
        let cursor = getCursor()
        activeNode = cursor.startContainer.parentElement;
    })

    return this
}

var richTextEditor = new Editor(
    {
        el: document.getElementById("editor"),
        placeholder: "Rozpocznij pisanie"
    }
)

function addTag() {
    let el = document.createElement('p')
    el.innerHTML = "&nbsp"
    return el
}

function getCursor() {
    let selection = window.getSelection()
    let cursor = selection.getRangeAt(0)

    return cursor
}
// el oznacza element w którym będzie kursor
function createCursor(el){
    let selection = getSelection()
    let range = new Range()
    range.setStart(el, 0)
    range.setEnd(el, 0)
    selection.removeAllRanges()
    selection.addRange(range)
}