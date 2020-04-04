
export class SocketRouter {
    constructor(store, socket_path) {
        this.socket_url = this._socketURL(socket_path)
        this.store = store || {dispatch: () => {}}
        this.disconnected_timeout = null
        this._setupSocket()
        global.addEventListener('unload', this.close.bind(this, false))  // send proper disconnect when page is closed
    }
    _socketURL(socket_path) {
        const host = global.location.hostname
        const port = global.location.port ? ':' + global.location.port : ''
        const prefix = global.location.protocol == 'https:' ? 'wss:' : 'ws:'
        let path = socket_path || global.location.pathname
        path = path.endsWith('/') ? path.substring(0, path.length-1) : path
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
        this.socket.onmessage = this._onmessage.bind(this)
    }
    send_mavlink(payload) {
        this.socket.send(JSON.stringify(payload))
        console.log("Mavlink sent: ", payload)
    }
    close(reopen=false) {
        const noop = () => {}
        this.socket = this.socket || {}
        this.socket.close = this.socket.close || noop
        this.socket.onmessage = noop
        this.socket.onopen = noop
        this.socket.onclose = noop
        if (reopen) {
            // dont hammer the server by having everyone reconnect at the same time
            const random_wait = 2 + Math.round(Math.random()*4*10)/10
            console.log(`%c[*] ATTEMPTING TO RECONNECT IN ${random_wait}s...`, 'color:orange')
            if (!this.disconnected_timeout) {
                this.disconnected_timeout = setTimeout(::this._setupSocket, random_wait * 1000)
            }
        }
        this.socket.close()
        this.socket = null
    }
    _onmessage(le_message) {
        const message = JSON.parse(le_message.data)
        if (message.mavpackettype){
            const {mavpackettype, ...mav_msg} = message
            this.store.dispatch({
                type: 'MAVMSG',
                args: {
                    mavtype: mavpackettype,
                    message: mav_msg
                }
            })
        }
    }
}
