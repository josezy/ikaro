import {send_mavcmd, send_mavmsg} from '@/reducers/mavlink'

export const send_command = commands =>
	{
		for (const command in commands){
			print(":)")
		}
	}
	

	// command = {
	// 	key = "MAV_CMD_NAV_RETURN_TO_LAUNCH",
	// 	params = {
	// 		"param1":0,
	// 		"param2":0,
	// 		"param3":0,
	// 		"param4":0,
	// 		"param5":0,
	// 		"param6":0,
	// 		"param7":0,
	// 	}
	// }

