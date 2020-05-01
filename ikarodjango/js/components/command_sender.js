import {send_mavcmd} from '@/reducers/mavlink'
import {MAVLINK_IDS} from '@/util/constants'

export class CommandSender {
    constructor(store) {
        this.store = store || {dispatch: () => {}}
    }
    send(...commands) {
        this.commands = commands
        this.cmd_index = 0
        this.unsubscribe = this.store.subscribe(this._subscribe.bind(this))
        this.store.dispatch(send_mavcmd(
            this.commands[this.cmd_index].command,
            this.commands[this.cmd_index].params
        ))
    }
    _subscribe() {
        const state = this.store.getState()
        const current_ack = state.mavlink && state.mavlink.COMMAND_ACK

        if (
            current_ack
            && MAVLINK_IDS[current_ack.command] == this.commands[this.cmd_index].command
            && current_ack.result == 0
        ) {
            this.cmd_index += 1
            if (this.cmd_index < this.commands.length) {
                this.store.dispatch(send_mavcmd(
                    this.commands[this.cmd_index].command,
                    this.commands[this.cmd_index].params
                ))
            } else {
                this.unsubscribe()
                this.cmd_index = -1
                this.commands = []
                this.unsubscribe = () => {}
            }
        }
    }
}
