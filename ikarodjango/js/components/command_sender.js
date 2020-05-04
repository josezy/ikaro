import {send_mavcmd} from '@/reducers/mavlink'
import {MAVLINK_IDS} from '@/util/constants'

export class CommandSender {
    constructor(store) {
        this.store = store || {dispatch: () => {}}
    }
    send(...commands) {
        this.commands = commands
        this.cmd_index = 0
        if (this.unsubscribe) this.unsubscribe()
        this.unsubscribe = this.store.subscribe(this._subscribe.bind(this))
        this._send_command()
    }
    _send_command() {
        this.store.dispatch(send_mavcmd(
            this.commands[this.cmd_index].command,
            this.commands[this.cmd_index].params
        ))
    }
    _subscribe() {
        if (this.cmd_index >= this.commands.length || this.cmd_index < 0) return this._end()
        if (!this.commands) return this._end()

        const state = this.store.getState()
        const current_ack = state.mavlink && state.mavlink.COMMAND_ACK
        const ack_command = current_ack && MAVLINK_IDS[current_ack.command]

        if (current_ack && ack_command == this.commands[this.cmd_index].command) {
            if (current_ack.result == 0) {
                this.cmd_index += 1
                if (-1 < this.cmd_index && this.cmd_index < this.commands.length) {
                    this._send_command()
                } else {
                    this._end()
                }
            } else {
                // TODO: handle other ACK results
                this._end()
            }
        }
    }
    _end() {
        this.unsubscribe()
        this.cmd_index = -1
        this.commands = []
    }
}
