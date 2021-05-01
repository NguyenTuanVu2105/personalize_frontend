// Source https://gist.github.com/Gericop/e33be1f201cf242197d9c4d0a1fa7335

function SemaphoreUpload (max, myFunc){
    let counter = 0
    let waiting = []
    let done = []

    let handle = myFunc

    this.setHandle = function (myHandle) {
        handle = myHandle
    }

    const take = function (){
        while (waiting.length > 0 && counter < max){
            counter++
            let promise = waiting.shift()
            promise.resolve(handle(promise.upload))
        }
    }

    this.release = function (id) {
        if (done.find(value => value === id) === undefined ) {
            counter--
            done.push(id)
            take()
        }
    }

    this.purge = function (){
        counter = 0
        waiting = []
        done = []
    }

    this.acquire = function(upload){
        let promise
        if(counter < max) {
            counter++
            promise = new Promise(resolve=> {
                resolve(handle(upload))
            })
        } else {
            promise = new Promise((resolve, err) => {
                waiting.push({resolve: resolve, err: err, upload: upload})
            })
        }
        return promise
    }




}


export default SemaphoreUpload