function rebinMax(  arr: Array<number>, idx0: number, idx1: number, len: number): Array<number> {
  const chunks = []
  let i = 0;
  
  const arrSlice = arr.slice(idx0, idx1)
  const n = arrSlice.length;
  const chunkLen = Math.round(n/len)

  let chunk;

  while (i < n) {
      chunk = arrSlice.slice(i,i += chunkLen);
      chunks.push(Math.max(...chunk))
  }

  return chunks

}

export default rebinMax