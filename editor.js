function Editor(settings) {
    let editor = settings.editor
    let placeholderTag = null
    let cursor = { el: null, offset: 0 }

/*   
    {
        editor.setAttribute('contenteditable', 'true');
        editor.innerHTML = '';
        placeholderTag = document.createElement('span');
        placeholderTag.textContent = settings.placeholder;
        editor.appendChild(placeholderTag);
    }
*/
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

                let selection = window.getSelection()
                let node = selection.anchorNode

                while(!isElement(node)) node = node.parentElement
                while(node.dataset.type != 'block') node = node.parentElement

                node.replaceWith(element(tag, node.innerHTML))
            });

            document.getElementById('tags').appendChild(div);
        }
    }

    let bold = document.getElementById("bold")

    function unBold(selection) {

    }

    

     /*
        node {
            element : HTMLElemnt,
            startOffset : ( startOffset : number ),
            endOffset : ( endOffset : number ),
            startNode : HTMLElement(span),
            endNode : HTMLElement(span)
            length : HTMLElemnt.textContent.length
        }
    */
    function boldBlock(block){
        let currNode = 
            block.startNode == block.endNode 
                ? block.startNode
                : block.startNode.nextElementSibling 
        
        while(currNode != block.endNode) {
            currNode.style.fontWeight = 'bold'
            currNode = currNode.nextElementSibling;
        }

        if(block.startNode === block.endNode) {
            return boldNode({
              element: block.startNode,
              startOffset: block.startOffset,
              endOffset: block.endOffset,
              length: block.startNode.textContent.length,
            })
        }else {
            let startNode = boldNode({
              element: block.startNode,
              startOffset: block.startOffset,
              endOffset: block.startNode.textContent.length,
              length: block.startNode.textContent.length,
            })
            let endNode = boldNode({
              element: block.endNode,
              startOffset: 0,
              endOffset: block.endOffset,
              length: block.endNode.textContent.length,
            });

            return {
              startNode: startNode.startNode,
              endNode: endNode.endNode,
              startOffset: startNode.startOffset,
              endOffset: endNode.endOffset,
            };
        }
    }
    /*
        node {
            element : HTMLElemnt,
            startOffset : ( startOffset : number ),
            endOffset : ( endOffset : number ),
            length : HTMLElemnt.textContent.length
        }
    */
    function boldNode(node){
        if (node.startOffset === 0 && node.endOffset === node.length) {
          return (node.element.style.fontWeight = 'bold');
        }
        if (node.startOffset === 0) {
          let bold = createNode(node.element.style);
          bold.style.fontWeight = 'bold';

          let resNode = createNode(node.element.style);
          node.element.replaceWith(bold);

          bold.textContent = node.element.textContent.substring(
            node.startOffset,
            node.endOffset
          );

          resNode.textContent = node.element.textContent.substring(
            node.endOffset,
            node.length
          );

          insertAfter(resNode, bold);

          return {
            startNode: bold,
            endNode: bold,
            startOffset: 0,
            endOffset: bold.textContent.length,
          }
        }

        if (node.endOffset === node.length) {
          let bold = createNode(node.element.style);
          bold.style.fontWeight = 'bold';

          let resNode = createNode(node.element.style);
          node.element.replaceWith(resNode);

          bold.textContent = node.element.textContent.substring(
            node.startOffset,
            node.endOffset
          );

          resNode.textContent = node.element.textContent.substring(
            0,
            node.startOffset
          );

          insertAfter(bold, resNode);

          return {
            startNode: bold,
            endNode: bold,
            startOffset: 0,
            endOffset: bold.textContent.length,
          }
        }

        let bold = createNode(node.element.style);
        bold.style.fontWeight = 'bold';

        let resStartNode = createNode(node.element.style);
        let resEndNode = createNode(node.element.style);

        bold.textContent = node.element.textContent.substring(
          node.startOffset,
          node.endOffset
        );

        resStartNode.textContent = node.element.textContent.substring(
          0,
          node.startOffset
        );

        resEndNode.textContent = node.element.textContent.substring(
          node.endOffset,
          node.length
        );

        node.element.replaceWith(resStartNode);
        insertAfter(bold, resStartNode);
        insertAfter(resEndNode, bold);

        return {
          startNode: bold,
          endNode: bold,
          startOffset: 0,
          endOffset: bold.textContent.length,
        }
    }

//POPRAWIĆ UNBOLD
    bold.addEventListener('click', (e) => {
        let selection = getSelection()
        
        if(selection.startBlock === selection.endBlock){
            setSelection(
              boldBlock({
                element: selection.startBlock,
                startNode: selection.startNode,
                endNode: selection.endNode,
                startOffset: selection.startOffset,
                endOffset: selection.endOffset,
              })
            )
        }else {
            let currBlock = 
                selection.startBlock === selection.endBlock 
                    ? selection.startBlock
                    : selection.startBlock.nextElementSibling

            while(selection.endBlock != currBlock) { 
                boldBlock({
                    element: currBlock,
                    startNode: currBlock.firstElementChild,
                    endNode: currBlock.lastElementChild,
                    startOffset: 0,
                    endOffset: currBlock.lastElementChild.textContent.length
                })

                currBlock = currBlock.nextElementSibling
            }

            let startSelection = boldBlock({
              element: selection.startBlock,
              startNode: selection.startNode,
              endNode: selection.startBlock.lastElementChild,
              startOffset: selection.startOffset,
              endOffset: selection.startBlock.lastElementChild.textContent.length,
            });

            let endSelecition = boldBlock({
              element: selection.endBlock,
              startNode: selection.endBlock.firstElementChild,
              endNode: selection.endNode,
              startOffset: 0,
              endOffset: selection.endOffset,
            });

            setSelection({
              startNode: startSelection.startNode,
              endNode: endSelecition.endNode,
              startOffset: startSelection.startOffset,
              endOffset: endSelecition.endOffset,
            });
        }
    })


    /* Utils Functions */
    var getElementFromNode = (node) => 
        isElement(node) ? node : node.parentElement

    var isElement = (node) => 
        node.nodeType === Node.ELEMENT_NODE ?  true : false
    
    var getSelection = () => { // <- to jest wazne!
        let selection = editor.ownerDocument.getSelection().getRangeAt(0)

        let startNode = getElementFromNode(selection.startContainer)
        startNode = getTextElement(startNode)
        let endNode = getElementFromNode(selection.endContainer)
        endNode = getTextElement(endNode)
        let startBlock = startNode.parentElement
        let endBlock = endNode.parentElement;

        return {
            startNode,
            endNode,
            startBlock,
            endBlock,
            startOffset: selection.startOffset,
            endOffset: selection.endOffset,
            isCollapsed: editor.ownerDocument.getSelection().isCollapsed
        }
    }

    var setSelection = (newSelection) => {
        let selection = editor.ownerDocument.getSelection()
        let range = document.createRange()
        range.setStart(
            newSelection.startNode.childNodes[0], 
            newSelection.startOffset
        )
        range.setEnd(
            newSelection.endNode.childNodes[0],
            newSelection.endOffset
        );

        selection.removeAllRanges()
        selection.addRange(range)
    }

    var insertAfter = (newNode, node) => {
      node.parentElement.insertBefore(newNode, node.nextSibling);
    };

    var getTextElement = (node) =>
        isText(node) ? node : node.parentElement

    var isText = (node) =>
        (node.dataset.hasOwnProperty('type') && 
            node.dataset.type === 'text')  
                ? true : false

    var addLine = (selection) => { 
        deleteFromSelection(selection);
        
        let node   = selection.startNode,
            offset = selection.startOffset
        
        let blockSelection = node.parentElement

        if(blockSelection.lastElementChild == node && offset == node.textContent.length) {
            return addEmptyLine(selection)
        }

        let currNode = node.nextElementSibling
        let nodeList = []

        while(currNode != null) {
            nodeList.push(currNode)
            let next = currNode.nextElementSibling
            blockSelection.removeChild(currNode)
            currNode = next
        }
        
        let block = document.createElement('p')
        block.dataset.type = 'block'

        let tempNode = document.createElement('span')
        
        for(let i = 0; i < node.style.length; i++)
            tempNode.style[node.style.item(i)] = node.style[node.style.item(i)]

        

        tempNode.textContent = node.textContent.substring(
          selection.startOffset,
          node.textContent.length
        );

        node.textContent = node.textContent.substring(
            0, selection.startOffset
        )

        block.innerHTML =
          `${tempNode.textContent && tempNode.outerHTML }` +
          nodeList.map((node) => node.outerHTML).join();

        insertAfter(block, node.parentElement)
        setSelection({
            startBlock: block,
            endBlock: block,
            startNode: block.firstElementChild,
            endNode: block.firstElementChild,
            startOffset: 0,
            endOffset: 0
        })
    }


    var addEmptyLine = (selection) => {
        let block = elementWithChilds('p', [
            {
                type: 'span',
                content: '<br>',
                data: 'text',
            }
        ]);

        insertAfter(block, selection.startBlock);

        setSelection({
            startNode: block.childNodes[0],
            endNode: block.childNodes[0],
            startOffset: 0,
            endOffset: 0, 
        })
    }

    var deleteFromSelection = (selection) => {
        if(!selection.isCollapsed) {
            let setNode = true
            let currBlock =
                selection.startBlock == selection.endBlock
                    ? selection.startBlock
                    : selection.startBlock.nextElementSibling;
            
            while (currBlock != selection.endBlock) {
                let next = currBlock.nextElementSibling;
                editor.removeChild(currBlock);
                currBlock = next;
            }

            let currNode = 
                selection.startNode == selection.endNode 
                    ? selection.startNode 
                    : selection.startNode.nextElementSibling 
                
            if (selection.startBlock == selection.endBlock ){
                if(selection.startNode == selection.endNode){
                    let str = selection.startNode.textContent.substring(
                      0,
                      selection.startOffset
                    ); 

                    str += selection.startNode.textContent.substring(
                        selection.endOffset,
                        selection.startNode.textContent.length
                    )
                    setNode = false
                    selection.startNode.textContent = str
                    setSelection({
                        startBlock: selection.endBlock,
                        endBlock: selection.endBlock,
                        startNode: selection.endNode,
                        endNode: selection.endNode,
                        startOffset: selection.startOffset,
                        endOffset: selection.startOffset,
                    });
                }else {
                    while (currNode != selection.endNode) {
                        let next = currNode.nextElementSibling
                        selection.startBlock.removeChild(currNode)
                        currNode = next
                    }
                }
            } else {
                let startNode = selection.startNode
                let endNode = selection.startBlock.lastElementChild

                let currNode = startNode.nextElementSibling

                while (currNode != null ){
                    let next = currNode.nextElementSibling;
                    selection.startBlock.removeChild(currNode);
                    currNode = next;
                }

                startNode = selection.endBlock.firstElementChild;
                endNode = selection.endNode

                currNode = startNode

                while (currNode != endNode) {
                    let next = currNode.nextElementSibling;
                    selection.endBlock.removeChild(currNode);
                    currNode = next;
                }
            }

            if(setNode) {
                let startContent = selection.startNode.textContent
                let endContent = selection.endNode.textContent

                let startNode = selection.startNode
                let endNode = selection.endNode
                startNode.textContent = startContent.substring(0, selection.startOffset);
                endNode.textContent = endContent.substring(selection.endOffset, endNode.textContent.length)

                setSelection({
                    startBlock: selection.endBlock,
                    endBlock: selection.endBlock,
                    startNode: selection.endNode,
                    endNode: selection.endNode,
                    startOffset: 0,
                    endOffset: 0
                })
            }
        }
    }
    /* End Utils */

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
            break;

            case 'Enter':
                e.preventDefault()
                addLine(getSelection());
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