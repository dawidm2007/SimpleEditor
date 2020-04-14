document.getElementById("tags")

function Editor(settings) {
    let tags = ['p', 'h1', 'h2', 'h3', 'h4'];   
    let el = settings.el;
    let placeholderTag = null;
    let activeNode = null;

    for(let tag of tags) {
        let div = document.createElement('div')
        div.innerHTML = tag
        div.addEventListener('mousedown', (e) => {
            e.preventDefault();
            if(activeNode != null) {
                let newEl = document.createElement(tag)
                newEl.innerHTML = activeNode.innerHTML
                document.getElementById('editor').replaceChild(newEl, activeNode)
                activeNode = newEl
            }
        })
        document.getElementById("tags").appendChild(div)
    }

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
                    lContent = ''
                    /* \u2008 lub &#8203  oba oznaczaja to samo czyli "zerową spację" */
                }

                

                newEl.innerHTML = lContent;
                insertAfter(newEl, activeNode);
                createCursor(newEl);
                activeNode = newEl;

            break;

            case 'Backspace':
                let edit = document.getElementById('editor')

                if(editor.children.length == 1) {
                    if(editor.children[0].textContent.length == 0) {
                        e.preventDefault()
                    }
                }
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
                if(newCursor.startContainer.nodeName == '#text')
                    activeNode = newCursor.startContainer.parentElement;
                else activeNode = newCursor.startContainer;
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
            tagP.innerHTML = ""
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
        if(cursor.startContainer.nodeName == '#text')
            activeNode = cursor.startContainer.parentElement;
        else    
            activeNode = cursor.startContainer
    })

    return this
}

var richTextEditor = new Editor(
    {
        el: document.getElementById("editor"),
        placeholder: "Rozpocznij pisanie"
    }
)

function insertAfter(newEl, after) {
    after.parentElement.insertBefore(newEl, after.nextSibiling);
}

function addTag() {
    let el = document.createElement('p')
    el.innerHTML = ""
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