import number2SIString from './number2SIString'

describe('number2SIString function', ()=> {
    test('integer', () => {
        expect(number2SIString(0)).toEqual('0 Hz')
        expect(number2SIString(1)).toEqual('1 Hz')
        expect(number2SIString(10)).toEqual('10 Hz')
        expect(number2SIString(1000)).toEqual('1 kHz')
        expect(number2SIString(1000000)).toEqual('1 MHz')
        expect(number2SIString(1000000000)).toEqual('1 GHz')
    })

    test('decimals', () => {
        expect(number2SIString(1.5)).toEqual('1.5 Hz')
        expect(number2SIString(10.5)).toEqual('10.5 Hz')
        expect(number2SIString(1500)).toEqual('1.5 kHz')
        expect(number2SIString(1500000)).toEqual('1.5 MHz')
        expect(number2SIString(1500000000)).toEqual('1.5 GHz')
    })

})