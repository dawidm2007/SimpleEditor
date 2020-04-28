function element(type = 'span', content = '', data = 'block') {  //return string => HTML
    let container = document.createElement('div')

    if(typeof content == 'string')
        container.innerHTML = `<${type} data-type="${data}">${content}</${type}>`;

    return container.firstChild
}

function elementWithChilds(type = 'p', content = []){
    let container = document.createElement(type)

    for(el of content)
        container.appendChild(element(el.type, el.content, el.data))   

    return container
}


/*
    element('p', [{type: 'span', content: 'tekst1'}])
    string
*/