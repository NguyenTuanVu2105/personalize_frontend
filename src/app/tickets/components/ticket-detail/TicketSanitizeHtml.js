export const SettingSanitize = {
    allowedAttributes: {
        a: ['href', 'name', 'target'],
            img: ['src'],
            '*': ['style']
    },
    transformTags: {
        'blockquote': function(tagName, attribs) {
            return {
                tagName: 'blockquote',
                attribs: {
                    style: 'display :none'
                }
            }
        }
    }
}