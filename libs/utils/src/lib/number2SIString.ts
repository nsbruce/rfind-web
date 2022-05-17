function number2SIString(x: number, fixed?:boolean):string {
    if (x < 1000){
        return `${fixed? x.toFixed(0): x} Hz`
    }
    else if (x < 1000000 && x >= 1000) {
        return `${fixed? (x/1000).toFixed(2) : x/1000} kHz`
    }
    else if (x < 1000000000 && x >= 1000000) {
        return `${fixed? (x/1000000).toFixed(3) : x/1000000} MHz`
    }
    else if (x < 1000000000000 && x >= 1000000000) {
        return `${fixed? (x/1000000000).toFixed(4) : x/1000000000} GHz`
    }
    else {
        return '?'
    }

}
export default number2SIString;