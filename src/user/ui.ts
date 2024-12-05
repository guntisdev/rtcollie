export function createVideo(container: HTMLDivElement): HTMLVideoElement {
    const videoTag = document.createElement('video')
    videoTag.autoplay = true
    videoTag.style.width = '100%'
    videoTag.style.height = '100%'
    container.innerHTML = ''
    container.appendChild(videoTag)
    videoTag.addEventListener('click', () => videoTag.play())
    return videoTag
}
