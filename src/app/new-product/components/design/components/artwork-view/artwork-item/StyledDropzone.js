import styled from 'styled-components'

const getColor = (props) => {
    if (props.isDragAccept) {
        return '#00e676'
    }
    if (props.isDragReject) {
        return '#ff1744'
    }
    if (props.isDragActive) {
        return '#2196f3'
    }
    return '#eeeeee'
}

const StyledDropzone = styled.div`
  flex: 1;
  height: 150px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  font-size: 18px;
  margin: 10px;
  border-width: 2px;
  border-radius: 2px;
  border-color: ${props => getColor(props)};
  border-style: dashed;
  background-color: #fafafa;
  color: #bdbdbd;
  outline: none;
  transition: border .24s ease-in-out;
`

export default StyledDropzone
