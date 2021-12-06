
export const VelocityCalc =  ()=> {

    var self = {},
        privateScope = {};
  
    privateScope.dt = 0.010
    privateScope.v0 = 0
    privateScope.velocity = 0 
    privateScope.acc_prom = 0
    privateScope.acc_accum = 0 
    privateScope.acc_counter = 0  
    privateScope.acc_timer = 0

    self.run = function (acc) {
        console.log(privateScope.acc_prom)
        if(privateScope.acc_counter!=0){
            if(privateScope.acc_counter!=0){
                privateScope.acc_prom =  privateScope.acc_accum/privateScope.acc_counter
                privateScope.acc_accum = 0 
                privateScope.acc_counter = 0  
            }

            aux = privateScope.velocity
            privateScope.velocity = privateScope.v0 + privateScope.dt*privateScope.acc_prom
            privateScope.v0 = aux
            privateScope.acc_timer = time.time()

        }
        else{

            privateScope.acc_counter += 1
            privateScope.acc_accum += acc
        }
        return privateScope.velocity;
    };

    return self;
};




export const PidController =  ()=> {

    var self = {},
        privateScope = {};

    /**
     *
     * @type {number}
     */
    privateScope.target = null;

    /**
     *
     * @type {{P: null, I: null, D: null}}
     */
    privateScope.gains = {
        P: null,
        I: null,
        D: null
    };

    /**
     *
     * @type {number}
     */
    privateScope.Iterm = 0;

    /**
     *
     * @type {{min: number, max: number}}
     */
    privateScope.ItermLimit = {
        min: -1000,
        max: 1000
    };

    /**
     *
     * @type {number}
     */
    privateScope.previousError = 0;

    /**
     *
     * @type {{min: number, max: number, minThreshold: number}}
     */
    privateScope.output = {
        min: null,
        max: null,
        minThreshold: null
    };

    /**
     *
     * @param {number} value
     */
    self.setTarget = function (value) {
        privateScope.target = value;
    };

    /**
     * @param {number} Pgain
     * @param {number} Igain
     * @param {number} Dgain
     */
    self.setGains = function (Pgain, Igain, Dgain) {
        privateScope.gains.P = Pgain;
        privateScope.gains.I = Igain;
        privateScope.gains.D = Dgain;
        return "hello"
    };

    /**
     * Sets min and max value for output
     * @param {number} min
     * @param {number} max
     * @param {number} minThreshold if output is below this value, [min] is returned
     */
    self.setOutput = function (min, max, minThreshold) {
        privateScope.output.min = min;
        privateScope.output.max = max;
        privateScope.output.minThreshold = minThreshold;
    };

    /**
     * Sets upper and lower limit for Iterm accumulator
     * @param {number} min
     * @param {number} max
     */
    self.setItermLimit = function (min, max) {
        privateScope.ItermLimit.min = min;
        privateScope.ItermLimit.max = max;
    };

    /**
     * Executes PID controller based on current value and target
     * @param {number} current
     * @returns {number}
     */
    self.run = function (current) {
        var error = current - privateScope.target,
            Pterm = error * privateScope.gains.P,
            Dterm = (error - privateScope.previousError) * privateScope.gains.D,
            output
        privateScope.previousError = error;

        privateScope.Iterm += error * privateScope.gains.I;
        if (privateScope.Iterm > privateScope.ItermLimit.max) {
            privateScope.Iterm = privateScope.ItermLimit.max;
        } else if (privateScope.Iterm < privateScope.ItermLimit.min) {
            privateScope.Iterm = privateScope.ItermLimit.min;
        }

        console.log("P",Pterm,"Iterm after",privateScope.Iterm, "Dterm",Dterm)
        output = Pterm + privateScope.Iterm + Dterm;
        
        if (output < privateScope.output.minThreshold) {
            output = privateScope.output.min;
        } else if (output > privateScope.output.max) {
            output = privateScope.output.max;
        }

        return output;
    };

    return self;
};
