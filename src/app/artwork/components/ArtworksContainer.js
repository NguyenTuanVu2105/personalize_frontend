import React from 'react'
import DocTitle from '../../shared/DocTitle'
import Artworks from './Artworks'

const ArtworksContainer = function (props) {

    return (
        <div>
            <DocTitle title="Artworks"/>
            <Artworks {...props} />
        </div>
    )
}

export default ArtworksContainer