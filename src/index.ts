import { createBroadcast } from "./broadcast/Broadcast"
import { createUser } from "./user/User"

window.onload = () => {
    const rootDiv: HTMLDivElement = document.querySelector('#root')!
    if (!rootDiv) throw new Error('No #root div found!')

    const path = window.location.pathname.slice(1).split('/')[0]

    console.log(path)

    if (path === 'user') {
        createUser(rootDiv)
    } else if (path === 'broadcast') {
        createBroadcast(rootDiv)
    } else {
        rootDiv.innerHTML = `
        <p><a href='broadcast/'>Go to broadcast</a></p>
        <p><a href='user/'>Go to user</a></p>
        `
    }
}

