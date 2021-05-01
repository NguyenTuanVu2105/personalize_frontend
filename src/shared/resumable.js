import _ from "lodash"

function ResumableChunk(fileObj, offset) {
    let $ = this
    $.getOpt = fileObj.getOpt
    $.fileObj = fileObj
    $.fileObjSize = fileObj.size
    $.fileObjType = fileObj.file.type
    $.offset = offset
    $.lastProgressCallback = new Date()
    $.retries = 0
    $.pendingRetry = false
    $.percent = 0
    $.xhr = null
    $.message = null
    $.cancelUpload = () => {
        fileObj.isCancel = true
        fileObj.handleFail()
    }
    $.started = false

    const chunkSize = $.getOpt('chunkSize')
    $.startByte = $.offset * chunkSize
    $.endByte = Math.min($.fileObjSize, ($.offset + 1) * chunkSize)
    if ($.fileObjSize - $.endByte < chunkSize) {
        $.endByte = $.fileObjSize
    }

    // send() uploads the actual data in a POST call
    $.send = function () {
        // Set up request and listen for event
        $.started = true
        $.xhr = new XMLHttpRequest()

        // Progress
        $.xhr.upload.addEventListener('progress', function (e) {
            if (new Date() - $.lastProgressCallback > $.getOpt('throttleProgressCallbacks') * 1000) {
                $.lastProgressCallback = new Date()
            }
            $.loaded = e.loaded || 0
            $.percent = parseFloat(e.loaded / e.total)
        }, false)
        $.loaded = 0
        $.pendingRetry = false

        // Done (either done, failed or retry)
        let doneHandler = function (e) {
            let status = $.status()
            // console.log('STATUS', status)
            if (status === 'success') {
                $.percent = 1
                $.fileObj.uploadNextChunk()
            } else if (status === 'error') {
                if (fileObj.notificationError <= 0) {
                    $.getOpt('errorCallback')($.message)
                    fileObj.notificationError++
                }
            } else {
                $.retries++
                let retryInterval = $.getOpt('chunkRetryInterval')
                if (retryInterval !== undefined) {
                    $.pendingRetry = true
                    setTimeout($.send, retryInterval)
                } else {
                    $.send()
                }
            }
        }
        $.xhr.addEventListener('load', doneHandler, false)
        $.xhr.addEventListener('error', doneHandler, false)
        $.xhr.addEventListener('timeout', doneHandler, false)

        let func = ($.fileObj.file.slice ? 'slice' : ($.fileObj.file.mozSlice ? 'mozSlice' : ($.fileObj.file.webkitSlice ? 'webkitSlice' : 'slice')))
        let bytes = $.fileObj.file[func]($.startByte, $.endByte, $.getOpt('setChunkTypeFromFile') ? $.fileObj.file.type : '')
        let data = new FormData()

        data.append('number', $.offset + 1)
        data.append('total', $.fileObj.chunks.length)
        data.append('file_name', $.fileObj.fileName)
        data.append('file_id', $.fileObj.fileId)
        data.append('file', bytes, $.fileObj.fileName)
        let target = $.getOpt('target')

        $.xhr.open('POST', target)
        $.xhr.timeout = $.getOpt('xhrTimeout')
        let customHeaders = $.getOpt('headers')
        Object.keys(customHeaders).forEach((k) => {
            $.xhr.setRequestHeader(k, customHeaders[k])
        })
        $.xhr.send(data)
    }
    $.status = function () {
        // Returns: 'pending', 'uploading', 'success', 'error'
        if ($.pendingRetry) {
            // if pending retry then that's effectively the same as actively uploading,
            // there might just be a slight delay before the retry starts
            return ('uploading')
        } else if (!$.xhr) {
            return ('pending')
        } else if ($.xhr.readyState < 4) {
            // Status is really 'OPENED', 'HEADERS_RECEIVED' or 'LOADING' - meaning that stuff is happening
            return ('uploading')
        } else {
            if ($.xhr.status === 200 || $.xhr.status === 201) {
                // HTTP 200, 201 (created)
                return ('success')
            } else if ($.getOpt('permanentErrors').includes($.xhr.status) || $.retries >= $.getOpt('maxChunkRetries')) {
                // HTTP 415/500/501, permanent error
                $.message = ('Error occurs while uploading your artwork. Please remove all artworks and try again')
                $.cancelUpload()
                return ('error')
            } else if ($.xhr.status === 429) {
                $.message = ('Too many requests. You are exceeded the artwork upload limit per day')
                $.cancelUpload()
                return ('error')
            } else {
                // this should never happen, but we'll reset and queue a retry
                // a likely case for this would be 503 service unavailable
                // $.abort()
                return ('error')
                // return ('pending')
            }
        }
    }
    $.handleCancel = () => {
        $.xhr.abort()
    }
    return (this)
}

function MergeChunk(fileObj) {
    let $ = this
    $.getOpt = fileObj.getOpt
    $.chunks = fileObj.chunks
    $.fileName = fileObj.fileName
    $.fileId = fileObj.fileId
    $.attachedData = fileObj.attachedData
    $.cancelUpload = () => {
        fileObj.isCancel = true
        fileObj.handleFail()
    }
    $.percent = 0

    $.xhr = new XMLHttpRequest()

    let doneHandler = function (e) {
        if ($.xhr.status === 200 || $.xhr.status === 201) {
            const result = $.getOpt('successCallback')(JSON.parse($.xhr.response))
            if (!_.isEmpty(result)) {
                if (fileObj.mergeDone) {
                    fileObj.mergeDone(fileObj.id, result)
                }
            }
        } else if ($.xhr.status === 429) {
            $.getOpt('errorCallback')('Too many requests. You ave exceeded the artwork upload limit per day')
            $.cancelUpload()
        } else {
            $.getOpt('errorCallback')('Error occurs while uploading your artwork. Please remove all artworks and try again')
            $.cancelUpload()
        }
        $.percent = 1
    }
    $.xhr.addEventListener('load', doneHandler, false)
    $.xhr.addEventListener('error', doneHandler, false)
    $.xhr.addEventListener('timeout', doneHandler, false)

    let data = new FormData()
    data.append('total', '' + $.chunks.length)
    data.append('file_name', $.fileName)
    data.append('file_id', $.fileId)
    $.xhr.open($.getOpt('mergeTargetMethod'), $.getOpt('mergeTarget'))
    let customHeaders = $.getOpt('headers')
    Object.keys($.getOpt('attachedData')).forEach((k) => {
        data.append(k, $.attachedData[k])
    })
    Object.keys(customHeaders).forEach((k) => {
        $.xhr.setRequestHeader(k, customHeaders[k])
    })
    $.xhr.send(data)
    return (this)
}


function Resumable(opts) {
    // PROPERTIES
    let $ = this
    $.defaults = {
        chunkSize: 1024 * 1024,
        forceChunkSize: false,
        simultaneousUploads: 5,
        throttleProgressCallbacks: 0.5,
        query: {},
        headers: {},
        preprocess: null,
        method: 'multipart',
        uploadMethod: 'POST',
        target: '/',
        getTarget: null,
        maxChunkRetries: 100,
        chunkRetryInterval: undefined,
        permanentErrors: [400, 404, 415, 500, 501],
        maxFiles: undefined,
        withCredentials: false,
        xhrTimeout: 0,
        setChunkTypeFromFile: false,
        minFileSize: 1,
        maxFileSize: undefined,
        mergeTargetMethod: 'POST',
        fileType: [],
        successCallback: (data) => {
            console.log('UPLOAD SUCCESS')
        },
        errorCallback: () => {
            console.log('ERROR')
        },
        progressCallback: (percent) => {
            // console.log(percent)
        },
        attachedData: {}
    }
    $.getOpt = function (o) {
        if (typeof $.opts[o] !== 'undefined') {
            return $.opts[o]
        } else {
            return $.defaults[o]
        }
    }

    $.opts = opts
    const file = opts.file
    $.file = $.opts.file
    $.fileName = file.fileName || file.name
    $.fileId = $.fileName + new Date().getTime()
    $.size = file.size
    $.attachedData = $.opts.attachedData
    $.chunks = []
    $.isCancel = false
    $.merge = null
    $.notificationError = 0
    $.uploadDone = null
    $.uploadFail = null
    $.mergeDone = null
    $.id = 0
    $.uploadSuccess = 0

    $.bootstrap = function () {
        $.chunks = []
        $._prevProgress = 0
        let maxOffset = Math.max(Math.floor($.file.size / $.getOpt('chunkSize')), 1)
        for (let offset = 0; offset < maxOffset; offset++) {
            $.chunks.push(new ResumableChunk($, offset))
        }
    }

    $.isUploading = () => {
        return $.chunks.some((chunk) => chunk.status() === 'uploading')
    }
    $.isComplete = () => {
        if ($.chunks.length > 0) {
            let outstanding = $.chunks.filter((chunk) => {
                let status = chunk.status()
                return (status !== 'success')
            })
            $.getOpt('progressCallback')(100 - outstanding.length * 100 / $.chunks.length)
            return outstanding.length === 0
        } else {
            return false
        }
    }

    // QUEUE
    $.uploadNextChunk = () => {
        if (!$.isCancel) {
            const found = $.chunks.some((chunk) => {
                if (chunk.status() === 'pending') {
                    chunk.send()
                    return true
                }
                return false
            })
            if (found) return true

            if ($.isComplete()) {
                if ($.uploadDone) {
                    $.uploadDone($.id)
                }
                $.merge = new MergeChunk($)
            }
        }
        return false
    }

    $.handleFail = () => {
        if ($.uploadFail) {
            $.uploadFail($.id)
        }
    }

    $.upload = () => {
        if ($.isUploading()) return
        if ($.chunks.length <= 0) {
            $.bootstrap()
        }
        for (let num = 1; num <= $.getOpt('simultaneousUploads'); num++) {
            $.uploadNextChunk()
        }
    }

    $.cancelUpload = () => {
        $.isCancel = true
        $.chunks.forEach((chunk) => {
            if (chunk.status() === 'uploading') {
                chunk.handleCancel()
            }
        })
        if ($.merge) {
            $.merge.xhr.abort()
        }
    }
}

export default Resumable
