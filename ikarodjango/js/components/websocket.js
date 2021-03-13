
export class SocketRouter {
    constructor(socket_path, onmessage, onopen) {
        this.socket_url = this._socketURL(socket_path)
        this.disconnected_timeout = null
        this._onmessage = onmessage
        this.custom_onopen = onopen
        this._setupSocket()
        global.addEventListener('unload', this.close.bind(this, false))  // send proper disconnect when page is closed
    }
    _socketURL(socket_path) {
        const host = global.location.hostname
        const port = global.location.port ? ':' + global.location.port : ''
        const prefix = global.location.protocol == 'https:' ? 'wss:' : 'ws:'
        let path = socket_path || global.location.pathname
        path = path.endsWith('/') ? path.substring(0, path.length - 1) : path
        return `${prefix}//${host}${port}${path}`
    }
    _setupSocket() {
        if (this.disconnected_timeout) {
            clearTimeout(this.disconnected_timeout)
            this.disconnected_timeout = null
        }
        this.socket = new WebSocket(this.socket_url)
        this.socket.onopen = this._onopen.bind(this)
        this.socket.onclose = this.close.bind(this, true)  // reconnect if socket closes unexpectedly
    }
    _onopen() {
        console.log("%c[+] SOCKET CONNECTED", 'color:orange')
        if (this.disconnected_timeout) {
            clearTimeout(this.disconnected_timeout)
            this.disconnected_timeout = null
        }
        this.socket.onmessage = this._onmessage
        if (this.custom_onopen) this.custom_onopen()
    }
    send(payload) {
        if (this.socket) this.socket.send(JSON.stringify(payload))
    }
    close(reopen = false) {
        const noop = () => { }
        this.socket = this.socket || {}
        this.socket.close = this.socket.close || noop
        this.socket.onmessage = noop
        this.socket.onopen = noop
        this.socket.onclose = noop
        if (reopen) {
            // dont hammer the server by having everyone reconnect at the same time
            const random_wait = 2 + Math.round(Math.random() * 4 * 10) / 10
            console.log(`%c[*] ATTEMPTING TO RECONNECT IN ${random_wait}s...`, 'color:orange')
            if (!this.disconnected_timeout) {
                this.disconnected_timeout = setTimeout(this._setupSocket, random_wait * 1000)
            }
        }
        this.socket.close()
        this.socket = null
    }
}
