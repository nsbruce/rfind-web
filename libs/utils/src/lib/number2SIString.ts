function number2SIString(x: number):string {
    if (x < 1000){
        return `${x} Hz`
    }
    else if (x < 1000000 && x >= 1000) {
        return `${x/1000} kHz`
    }
    else if (x < 1000000000 && x >= 1000000) {
        return `${x/1000000} MHz`
    }
    else if (x < 1000000000000 && x >= 1000000000) {
        return `${x/1000000000} GHz`
    }
    else {
        return '?'
    }

}
export default number2SIString;