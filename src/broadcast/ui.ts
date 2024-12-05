export function createButton(container: HTMLDivElement) {
    const button = document.createElement('input')
    button.type = 'button'
    button.value = 'clickable button'
    button.style.width = '200px'
    button.style.height = '50px'
    button.addEventListener('click', () => console.log('BUTTON CLICKED'))
    button.addEventListener('click', () => button.style.backgroundColor = getRandomColor())
    container.appendChild(button)
}

export function createRedPoint(container: HTMLDivElement): HTMLDivElement {
    const red = document.createElement('div')
    red.style.position = 'absolute'
    red.style.width = '10px'
    red.style.height = '10px'
    red.style.borderRadius = '5px'
    red.style.top = '0'
    red.style.left = '0'
    red.style.backgroundColor = 'red'
    red.style.pointerEvents = 'none'

    container.appendChild(red)
    return red
}

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}