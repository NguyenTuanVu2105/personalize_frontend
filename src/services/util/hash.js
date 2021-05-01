import asmCrypto from 'asmcrypto-lite'

export const sha256Hash = async (file) => {
    try {
        let digest = await readFileAsync(file)
        // console.log(digest);
        return digest
    } catch (err) {
        console.log(err)
    }
}

function readFileAsync(file) {
    return new Promise((resolve, reject) => {
        let reader = new FileReader()

        reader.onload = async (event) => {
            var fileData = event.target.result
            resolve(await asmCrypto.SHA256.hex(fileData))
        }

        reader.onerror = reject

        reader.readAsArrayBuffer(file)
    })
}
