function MemStorage() {
}

MemStorage.prototype = {
    setItem: function (name, value) {
        this[name] = value
    },
    getItem: function (name) {
        return this[name]
    },
    removeItem: function (name) {
        if (this[name] && typeof this[name] !== 'function') {
            delete this[name]
        }
    },
    clear: function () {
        for (var name in this) {
            if (this.hasOwnProperty(name))
                delete this[name]
        }
    }
}
export default MemStorage
