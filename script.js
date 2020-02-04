function bold() {
    document.execCommand("bold")
}

function italic() {
    document.execCommand("italic")
}

function changeFont() {
    document.execCommand("fontName", false, "Arial")
}
let fonts = [
    "Calibri",
    "Bebas Neue",
    "Georgia",
    "Small Fonts",
    "Times New Roman",
    "Segoe UI Semilight",
    "Ink Free",
    "Comic Sans MS"
]

let currentFont = "Calibri"

let fontList = document.getElementById("font-list")

for(let font of fonts) {
    let fontItem = document.createElement("div")
    fontItem.setAttribute("class", "font-item")
    let fontName = document.createElement("h1")
    fontName.style.fontFamily = font
    fontName.textContent = font

    fontItem.appendChild(fontName)

    fontItem.addEventListener("mouseover", () => {
        document.execCommand("fontName", false, font)
    })

    fontItem.addEventListener("mousedown", (event) => {
        currentFont = font
        let currFont = document.getElementById("font-current")
        currFont.children[0].style.fontFamily = font
        currFont.children[0].textContent = font
    })
    
    fontList.appendChild(fontItem)
}

fontList.addEventListener("mouseleave", () => {
    document.execCommand("fontName", false, currentFont)
})