function Editor(settings) {
  let editor = settings.editor
  let placeholderTag = null
  let cursor = { el: null, offset: 0 }

  let menu = new MicroMenu(this, editor)
  let sidebar = new SidebarMenu(this, editor);
  let hasFocus = false

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
  }

  


  /*
    @function: unModifySelection (
      @selction: object,
      @modifire: object
    )
  */

  function unModifySelection(selection, modifier) {
    //if only one block selected only, change this block
    if (selection.startBlock === selection.endBlock) {
      let restoreSelection = unModifyBlock(
        {
          element: selection.startBlock,
          startNode: selection.startNode,
          endNode: selection.endNode,
          startOffset: selection.startOffset,
          endOffset: selection.endOffset,
        },
        modifier
      );
      return setSelection(restoreSelection);
    }

    let currBlock = 
      (selection.startBlock === selection.endBlock )
        ? selection.startBlock
        : selection.startBlock.nextElementSibling

    //unmodify middle blocks
    while (selection.endBlock != currBlock) {
      unModifyBlock(
        {
          element: currBlock,
          startNode: currBlock.firstElementChild,
          endNode: currBlock.lastElementChild,
          startOffset: 0,
          endOffset: currBlock.lastElementChild.textContent.length,
        }, 
        modifier
      );

      currBlock = currBlock.nextElementSibling;
    }

    //unmodify first block
    let startSelection = unModifyBlock(
      {
        element: selection.startBlock,
        startNode: selection.startNode,
        endNode: selection.startBlock.lastElementChild,
        startOffset: selection.startOffset,
        endOffset: selection.startBlock.lastElementChild.textContent.length,
      }, 
      modifier
    )

    //unmodify first block
    let endSelecition = unModifyBlock(
      {
        element: selection.endBlock,
        startNode: selection.endBlock.firstElementChild,
        endNode: selection.endNode,
        startOffset: 0,
        endOffset: selection.endOffset,
      }, 
      modifier
    );

    //restore selection
    setSelection({
      startNode: startSelection.startNode,
      endNode: endSelecition.endNode,
      startOffset: startSelection.startOffset,
      endOffset: endSelecition.endOffset,
    });
  }

  function unModifyBlock(block, modifier){
    let currNode =
      block.startNode == block.endNode
        ? block.startNode
        : block.startNode.nextElementSibling;

    let prevNode = null
    let same = true

    while (currNode != block.endNode) {
      let unModifiedNode = unModifyNode(
        {
          element: currNode,
          startOffset: 0,
          endOffset: currNode.textContent.length,
          length: currNode.textContent.length,
        },
        modifier
      ).startNode;

      if(prevNode && unModifiedNode.style.length == prevNode.style.length){
        for(let i = 0; i < prevNode.style.length; i++) {
            let currStyleName = prevNode.style[i]
            if(!(unModifiedNode.style[currStyleName] == prevNode.style[currStyleName])) {
                same = false
            }
        }
      }else {
          same = false
      }

      if(same) {
        prevNode.textContent += unModifiedNode.textContent;
        block.element.removeChild(unModifiedNode);
        currNode = prevNode.nextElementSibling
      }else {
        prevNode = unModifiedNode;
        currNode = unModifiedNode.nextElementSibling;
      }

      same = true
    }

    if (block.startNode === block.endNode) {
      return unModifyNode(
        {
          element: block.startNode,
          startOffset: block.startOffset,
          endOffset: block.endOffset,
          length: block.startNode.textContent.length,
        },
        modifier
      );
    } else {
      let startNode = unModifyNode(
        {
          element: block.startNode,
          startOffset: block.startOffset,
          endOffset: block.startNode.textContent.length,
          length: block.startNode.textContent.length,
        },
        modifier
      );

      let endNode = unModifyNode(
        {
          element: block.endNode,
          startOffset: 0,
          endOffset: block.endOffset,
          length: block.endNode.textContent.length,
        }, 
        modifier
      );

      return {
        startNode: startNode.startNode,
        endNode: endNode.endNode,
        startOffset: startNode.startOffset,
        endOffset: endNode.endOffset,
      };
    }
  }

  function unModifyNode(node, modifier) {
    if (node.startOffset === 0 && node.endOffset === node.length) {
        node.element.style[modifier.style] = null;
        return {
          startNode: node.element,
          endNode: node.element,
          startOffset: 0,
          endOffset: node.element.textContent.length,
        };
    }

    let modifierNode = createNode(node.element.style);
    modifierNode.style[modifier.style] = null;

    let resNode = createNode(node.element.style);

    if (node.startOffset === 0) {
      
      node.element.replaceWith(modifierNode);

      modifierNode.textContent = node.element.textContent.substring(
        node.startOffset,
        node.endOffset
      );

      resNode.textContent = node.element.textContent.substring(
        node.endOffset,
        node.length
      );

      insertAfter(resNode, modifierNode);

      return {
        startNode: modifierNode,
        endNode: modifierNode,
        startOffset: 0,
        endOffset: modifierNode.textContent.length,
      };
    }

    if (node.endOffset === node.length) {
      node.element.replaceWith(resNode);

      modifierNode.textContent = node.element.textContent.substring(
        node.startOffset,
        node.endOffset
      );

      resNode.textContent = node.element.textContent.substring(
        0,
        node.startOffset
      );

      insertAfter(modifierNode, resNode);

      return {
        startNode: modifierNode,
        endNode: modifierNode,
        startOffset: 0,
        endOffset: modifierNode.textContent.length,
      };
    }

    let resStartNode = createNode(node.element.style);
    let resEndNode = createNode(node.element.style);

    modifierNode.textContent = node.element.textContent.substring(
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
    insertAfter(modifierNode, resStartNode);
    insertAfter(resEndNode, modifierNode);

    return {
      startNode: modifierNode,
      endNode: modifierNode,
      startOffset: 0,
      endOffset: modifierNode.textContent.length,
    };   
  }


   /*
    modifier: object {
      style: string,
      value: string
    }
  */

  function modifySelection(selection, modifier) {
       if (selection.startBlock === selection.endBlock) {
         setSelection(
           modifyBlock({
             element: selection.startBlock,
             startNode: selection.startNode,
             endNode: selection.endNode,
             startOffset: selection.startOffset,
             endOffset: selection.endOffset,
           }, modifier)
         );
       } else {
         let currBlock =
           selection.startBlock === selection.endBlock
             ? selection.startBlock
             : selection.startBlock.nextElementSibling;

         while (selection.endBlock != currBlock) {
           modifyBlock(
             {
               element: currBlock,
               startNode: currBlock.firstElementChild,
               endNode: currBlock.lastElementChild,
               startOffset: 0,
               endOffset: currBlock.lastElementChild.textContent.length,
             },
             modifier
           );

           currBlock = currBlock.nextElementSibling;
         }

         let startSelection = modifyBlock(
           {
             element: selection.startBlock,
             startNode: selection.startNode,
             endNode: selection.startBlock.lastElementChild,
             startOffset: selection.startOffset,
             endOffset:
               selection.startBlock.lastElementChild.textContent.length,
           },
           modifier
         );

         let endSelecition = modifyBlock(
           {
             element: selection.endBlock,
             startNode: selection.endBlock.firstElementChild,
             endNode: selection.endNode,
             startOffset: 0,
             endOffset: selection.endOffset,
           },
           modifier
         );


         setSelection({
           startNode: startSelection.startNode,
           endNode: endSelecition.endNode,
           startOffset: startSelection.startOffset,
           endOffset: endSelecition.endOffset,
         });
       }
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
  function modifyBlock(block, modifier){
      let currNode = 
          block.startNode == block.endNode 
              ? block.startNode
              : block.startNode.nextElementSibling 
      
      while(currNode != block.endNode) {
          modifyNode(
            {
              element: currNode,
              startOffset: 0,
              endOffset: currNode.textContent.length,
              length: currNode.textContent.length,
            },
            modifier
          );
          currNode = currNode.nextElementSibling;
      }

      if(block.startNode === block.endNode) {
          return modifyNode(
            {
              element: block.startNode,
              startOffset: block.startOffset,
              endOffset: block.endOffset,
              length: block.startNode.textContent.length,
            },
            modifier
          );
      } else {

          let startNode = modifyNode(
            {
              element: block.startNode,
              startOffset: block.startOffset,
              endOffset: block.startNode.textContent.length,
              length: block.startNode.textContent.length,
            },
            modifier
          );


          let endNode = modifyNode(
            {
              element: block.endNode,
              startOffset: 0,
              endOffset: block.endOffset,
              length: block.endNode.textContent.length,
            },
            modifier
          );


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
  function modifyNode(node, modifier){
      if (node.startOffset === 0 && node.endOffset === node.length) {
        node.element.style[modifier.style] = modifier.value;
        return {
          startNode: node.element,
          endNode: node.element,
          startOffset: 0,
          endOffset: node.endOffset,
        };
      }

      if (node.startOffset === 0) {
        let modifierNode = createNode(node.element.style);
        modifierNode.style[modifier.style] = modifier.value;

        let resNode = createNode(node.element.style);
        node.element.replaceWith(modifierNode);

        modifierNode.textContent = node.element.textContent.substring(
          node.startOffset,
          node.endOffset
        );

        resNode.textContent = node.element.textContent.substring(
          node.endOffset,
          node.length
        );

        insertAfter(resNode, modifierNode);

        return {
          startNode: modifierNode,
          endNode: modifierNode,
          startOffset: 0,
          endOffset: modifierNode.textContent.length,
        };
      }

      if (node.endOffset === node.length) {
        let modifierNode = createNode(node.element.style);
        modifierNode.style[modifier.style] = modifier.value;

        let resNode = createNode(node.element.style);
        node.element.replaceWith(resNode);

        modifierNode.textContent = node.element.textContent.substring(
          node.startOffset,
          node.endOffset
        );

        resNode.textContent = node.element.textContent.substring(
          0,
          node.startOffset
        );

        insertAfter(modifierNode, resNode);
        return {
          startNode: modifierNode,
          endNode: modifierNode,
          startOffset: 0,
          endOffset: modifierNode.textContent.length,
        };
      }

      let modifierNode = createNode(node.element.style);
      modifierNode.style[modifier.style] = modifier.value;

      let resStartNode = createNode(node.element.style);
      let resEndNode = createNode(node.element.style);

      modifierNode.textContent = node.element.textContent.substring(
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
      insertAfter(modifierNode, resStartNode);
      insertAfter(resEndNode, modifierNode);


      return {
        startNode: modifierNode,
        endNode: modifierNode,
        startOffset: 0,
        endOffset: modifierNode.textContent.length,
      };
  }

  this.checkModifier = function(modifier) {
    let selection = getSelection();

    let toModify = true;

    let currBlock = selection.startBlock;
    let currNode = selection.startNode;
    let endNode = selection.endNode;

    while (currBlock != selection.endBlock.nextElementSibling) {
      currBlock == selection.endBlock
        ? (endNode = selection.endNode)
        : (endNode = currBlock.lastElementChild);

      while (currNode != endNode.nextElementSibling) {
        if (currNode.style[modifier.style] == modifier.value) {
          toModify = false;
        }
        currNode = currNode.nextElementSibling;
      }

      currBlock = currBlock.nextElementSibling;
      if (currBlock) currNode = currBlock.firstElementChild;
    }

    return toModify
  }

  this.toggleModifier = function(modifier) {
    let selection = getSelection();

    

    if (this.checkModifier(modifier))
      modifySelection(selection, modifier);
    else
      unModifySelection(selection, modifier);
  }

  

  let italic = document.getElementById("italic")
  let bold = document.getElementById('bold')

  italic.addEventListener('click', (e) => {
    this.toggleModifier({ style: 'fontStyle', value: 'italic' });
  });

  bold.addEventListener('click', (e) => {
      this.toggleModifier({style: 'fontWeight', value: 'bold'})
  })


  
  
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

  this.virtualGetSelection = function() {
    return getSelection()
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

  editor.addEventListener('focusin', () => {
    hasFocus = true;
  });

  editor.addEventListener('focusout', () => {
    hasFocus = false;
  })

  editor.ownerDocument.addEventListener('selectionchange', (e) => {
    if(hasFocus) {
      let selection = editor.ownerDocument.getSelection()
      let rect = selection.getRangeAt(0).getBoundingClientRect();

      if(selection.type === 'Range')
        menu.show(rect);
      else 
        menu.hide()

      sidebar.show(rect);

    }else {
      menu.hide();
      sidebar.hide();
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

function MicroMenu(editor, element) {
this.menu = document.createElement('div')
this.menu.classList.add('micro-menu')

let boldModifier = { style: 'fontWeight', value: 'bold' }
let italicModifier = { style: 'fontStyle', value: 'italic' }

let bold = document.createElement('div')
bold.innerHTML = '<i class="fas fa-bold"></i>';
bold.classList.add('item');
bold.addEventListener('mousedown', (e) => {
  e.preventDefault()
  editor.toggleModifier(boldModifier);
  this.show(window.getSelection().getRangeAt(0).getBoundingClientRect());
})

let italic = document.createElement('div');
italic.innerHTML = '<i class="fas fa-italic"></i>';
italic.classList.add('item')
italic.addEventListener('mousedown', (e) => {
  e.preventDefault();
  editor.toggleModifier(italicModifier);
  this.show(window.getSelection().getRangeAt(0).getBoundingClientRect());
});

this.menu.appendChild(bold)
this.menu.appendChild(italic);


this.menu.style.visibility = 'hidden';
element.parentElement.appendChild(this.menu);

this.show = function(rect) {
  let onlyIn = false
  let select = window.getSelection().getRangeAt(0).commonAncestorContainer 
  while (select.nodeName != 'body') {
    if(select == element){
      onlyIn = true
      break;
    }

    select = select.parentElement
  }

  if(onlyIn){
    let boldUnactive = editor.checkModifier(boldModifier)
    let italicUnactive = editor.checkModifier(italicModifier)

    if(!boldUnactive){
      bold.classList.add('active')
    } else {
      bold.classList.remove('active');
    }

    if (!italicUnactive) {
      italic.classList.add('active');
    } else {
      italic.classList.remove('active');
    }

    this.menu.style.visibility = 'visible';
    this.menu.style.top = `${rect.top - 30}px`;
    this.menu.style.left = `${rect.left + (rect.right - rect.left)/2 - 25}px`;
  }
}

this.hide = function() {
  this.menu.style.visibility = 'hidden';
}

return this
}


function SidebarMenu(editor, container) {
this.menu = document.createElement('div');
this.menu.classList.add('sidebar-menu');


for (let tag of ['P', 'H1', 'H2', 'H3', 'H4']) {
    let div = document.createElement('div');
    div.innerHTML = tag;
    div.classList.add('item')
    
    div.addEventListener('mousedown', (e) => {
        e.preventDefault();

        let selection = window.getSelection()
        let nodeStart = selection.anchorNode;
        let nodeEnd = selection.focusNode;

      
        

        while (!isElement(nodeEnd)) nodeEnd = nodeEnd.parentElement;
        while (nodeEnd.dataset.type != 'block') nodeEnd = nodeEnd.parentElement;

        while (!isElement(nodeStart)) nodeStart = nodeStart.parentElement;
        while (nodeStart.dataset.type != 'block') nodeStart = nodeStart.parentElement;


        console.log(
          'start',
          nodeStart.scrollTop,
          '\n',
          'end',
          nodeEnd.scrollTop
        );

        if (nodeStart.scrollTop > nodeEnd.scrollTop) {
          let nodeTemp = nodeStart;
          nodeStart = nodeEnd;
          nodeEnd = nodeTemp;
        }

        /* przywrócić stan selection */
        let nodeCurr = nodeStart;

    
        while (nodeCurr != nodeEnd) {
          let nodeTemp = nodeCurr.nextElementSibling
          nodeCurr.replaceWith(element(tag, nodeCurr.innerHTML));
          nodeCurr = nodeTemp;
        }

        nodeCurr.replaceWith(element(tag, nodeCurr.innerHTML));
        
    });

    this.menu.appendChild(div);
}

this.show = function (rect) {
    this.menu.style.visibility = 'visible';
    this.menu.style.top = `${rect.top}px`;
    this.menu.style.left = `${ editor.clientLeft}px`;
};

this.hide = function () {
  this.menu.style.visibility = 'hidden';
};

/*{
  this.menu.style.visibility = 'visible';
  this.menu.style.top = `0px`;
  this.menu.style.left = `0px`;
}*/
container.parentElement.appendChild(this.menu);

return this;
}



/* Utils Functions */
var getElementFromNode = (node) => 
  isElement(node) ? node : node.parentElement

var isElement = (node) => 
  node.nodeType === Node.ELEMENT_NODE ?  true : false