function Editor(settings) {
    let el = settings.el;
    let placeholderTag = null;
    let cursor = null;

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
                cursor.surroundContents(newEl)
                createCursor(newEl)
            default:
            break;
        }
    })

    el.addEventListener('focus', (e) => {
        if(el.children[0] == placeholderTag) {
            e.preventDefault()
            el.innerHTML = ""
            let tagP = addTag()
            el.appendChild(tagP)
            createCursor(tagP)
        }
    })

    el.addEventListener('blur', (e) => {
        if(
            el.children[0].textContent.length == 0 &&
            el.children.length == 1
        ){
            el.innerHTML = ""
            el.appendChild(placeholderTag)
        }
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