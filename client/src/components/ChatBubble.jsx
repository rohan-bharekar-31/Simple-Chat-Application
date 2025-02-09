import React from 'react'

const ChatBubble = ({name,message}) => {
    return (
        <div className="chat chat-start">
            <div className="chat-header">
                {name}
            </div>
            <div className="chat-bubble">{message}</div>
           
        </div>
    )
}

export default ChatBubble